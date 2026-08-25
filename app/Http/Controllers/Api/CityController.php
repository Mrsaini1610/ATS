<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Exception;
use App\Models\State;
use App\Models\City;

class CityController extends Controller
{
    public function fetchAndSyncStates()
    {
        try {
            // 1. Call API
            $response = Http::withoutVerifying()->timeout(30)->get('https://uat.apiclub.in/api/v1/states/IN');

            if (!$response->successful()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to retrieve data from API.',
                    'error' => $response->body()
                ], $response->status());
            }

            $apiData = $response->json();

            // Adjust payload key depending on API response structure
            $statesData = $apiData['response'] ?? $apiData['data'] ?? $apiData;

            if (empty($statesData) || !is_array($statesData)) {
                return response()->json([
                    'status' => false,
                    'message' => 'No state data found in API response.'
                ], 404);
            }

            $insertData = [];
            $now = now();

            foreach ($statesData as $item) {
                $insertData[] = [
                    'uuid'         => (string) Str::uuid(),
                    'name'         => $item['name'] ?? $item['state_name'] ?? null,
                    'country_code' => $item['country_code'] ?? 'IN',
                    'country_name' => $item['country_name'] ?? 'India',
                    'state_code'   => $item['state_code'] ?? $item['iso2'] ?? null,
                    'type'         => $item['type'] ?? null,
                    'latitude'     => $item['latitude'] ?? $item['lat'] ?? null,
                    'longitude'    => $item['longitude'] ?? $item['lng'] ?? null,
                    'created_at'   => $now,
                ];
            }

            DB::transaction(function () use ($insertData) {
                State::upsert(
                    $insertData,
                    ['state_code'], 
                    ['name', 'country_code', 'country_name', 'type', 'latitude', 'longitude']
                );
            });

            return response()->json([
                'status'  => true,
                'message' => 'States inserted/updated successfully.',
                'count'   => count($insertData)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred while saving states.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function fetchAndSyncCities()
    {
        set_time_limit(0);
        ini_set('max_execution_time', '0');

        try {
            // 1. Database se dynamic state code aur UUID fetch karein
            $states = State::whereNotNull('state_code')->get(['uuid', 'state_code']);

            if ($states->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No states found in database. Run state sync first.'
                ], 404);
            }

            $totalProcessedCities = 0;

            foreach ($states as $state) {
                $apiUrl = "https://uat.apiclub.in/api/v1/cities/{$state->state_code}";

                $response = Http::withoutVerifying()->timeout(0)->get($apiUrl);

                if (!$response->successful()) {
                    continue; 
                }

                $apiData = $response->json();
                $citiesData = $apiData['response'] ?? $apiData['data'] ?? $apiData;

                if (empty($citiesData) || !is_array($citiesData)) {
                    continue;
                }

                $insertData = [];
                $now = now();

                foreach ($citiesData as $item) {
                    $insertData[] = [
                        'uuid'       => (string) Str::uuid(),
                        'state_uuid' => $state->uuid,
                        'name'       => $item['name'] ?? $item['city_name'] ?? null,
                        'latitude'   => $item['latitude'] ?? $item['lat'] ?? null,
                        'longitude'  => $item['longitude'] ?? $item['lng'] ?? null,
                        'created_at' => $now,
                    ];
                }

                if (!empty($insertData)) {
                    foreach (array_chunk($insertData, 500) as $chunk) {
                        DB::transaction(function () use ($chunk) {
                            City::upsert(
                                $chunk,
                                ['name', 'state_uuid'], 
                                ['latitude', 'longitude', 'updated_at']
                            );
                        });
                    }

                    $totalProcessedCities += count($insertData);
                }
            }

            return response()->json([
                'status'  => true,
                'message' => 'Cities fetched and synced dynamically.',
                'total_cities' => $totalProcessedCities
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred while syncing cities.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function importCities()
    {
        set_time_limit(0);

        try {
            // 1. Fetch valid state codes and UUIDs
            $states = DB::table('states')
                ->select('id', 'uuid', 'state_code')
                ->whereNotNull('state_code')
                ->whereNotNull('uuid')
                ->get();

            if ($states->isEmpty()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'States table me valid state_code ya uuid nahi mila.'
                ], 404);
            }

            $totalInserted = 0;
            $skippedStates = [];

            foreach ($states as $state) {
                $stateCode = trim($state->state_code);
                $apiUrl = "https://uat.apiclub.in/api/v1/cities/{$stateCode}";

                $response = Http::withoutVerifying()->timeout(30)->get($apiUrl);

                if ($response->successful()) {
                    $json = $response->json();
                    $citiesList = $json['response'] ?? $json['data'] ?? (is_array($json) ? $json : []);

                    if (!empty($citiesList) && is_array($citiesList)) {
                        $recordsToInsert = [];

                        foreach ($citiesList as $city) {
                            $cityName = is_array($city) ? ($city['name'] ?? $city['city_name'] ?? null) : $city;

                            if (!empty($cityName)) {
                                $recordsToInsert[] = [
                                    'uuid'       => (string) Str::uuid(),
                                    'state_uuid' => $state->uuid,
                                    'name'       => trim($cityName),
                                    'latitude'   => is_array($city) ? ($city['latitude'] ?? null) : null,
                                    'longitude'  => is_array($city) ? ($city['longitude'] ?? null) : null,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                            }
                        }

                        if (!empty($recordsToInsert)) {
                            foreach (array_chunk($recordsToInsert, 100) as $chunk) {
                                DB::table('cities')->insert($chunk);
                            }
                            $totalInserted += count($recordsToInsert);
                        }
                    }
                } else {
                    $skippedStates[] = $stateCode;
                }

                // Rate limiting delay
                usleep(150000);
            }

            return response()->json([
                'status'         => true,
                'message'        => 'Cities successfully import ho gayi hain!',
                'total_inserted' => $totalInserted,
                'failed_states'  => $skippedStates
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getState(Request $request)
    {
        $states = State::select('name', 'uuid')->get();

        return response()->json([
            'status' => true,
            'data'   => $states
        ], 200);
    }

    public function getCitybyState(Request $request)
    {
        $stateUuid = $request->input('state_uuid');

        if (!$stateUuid) {
            return response()->json([
                'status'  => false,
                'message' => 'State UUID is required.'
            ], 400);
        }

        $cities = DB::table('cities')
            ->where('state_uuid', $stateUuid)
            ->select('name', 'uuid')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $cities
        ], 200);
    }

    
public function getTownsByCity(Request $request)
{
    // 1. PHP execution time badhayein taaki timeout na ho
    set_time_limit(300);
    ini_set('max_execution_time', '300');

    // 2. Validation
    $validator = Validator::make($request->all(), [
        'city_uuid' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status'  => false,
            'message' => 'Validation error',
            'errors'  => $validator->errors()
        ], 422);
    }

    $cityUuid = $request->input('city_uuid');

    try {
        // 3. Database se City aur State fetch karein
        $city = DB::table('cities')
            ->leftJoin('states', 'cities.state_uuid', '=', 'states.uuid')
            ->where('cities.uuid', $cityUuid)
            ->select(
                'cities.name as city_name',
                'states.state_code',
                'states.name as state_name'
            )
            ->first();

        if (!$city) {
            return response()->json([
                'status'  => false,
                'message' => 'City record not found for the given UUID.'
            ], 404);
        }

        $cityName = trim($city->city_name);

        // State ISO format (e.g. IN-RJ)
        $stateIso = 'IN-RJ';
        if (!empty($city->state_code)) {
            $code = strtoupper(trim($city->state_code));
            $stateIso = str_starts_with($code, 'IN-') ? $code : "IN-{$code}";
        }

        // 4. Fast & Optimized Overpass Query (Targeting places directly inside the district)
        $overpassQuery = <<<OVERPASS
[out:json][timeout:180];
area["ISO3166-2"="{$stateIso}"]["admin_level"="4"]->.state;
area["name"~"^{$cityName}( District)?$"]["boundary"="administrative"](area.state)->.district;
(
  node["place"~"^(city|town|suburb|quarter|neighbourhood|municipality|census_town|village)$"](area.district);
  way["place"~"^(city|town|suburb|quarter|neighbourhood|municipality|census_town|village)$"](area.district);
);
out center tags;
OVERPASS;

        // 5. Fast Mirror Endpoints
        $endpoints = [
            'https://overpass.kumi.systems/api/interpreter',
            'https://overpass-api.de/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
        ];

        $apiData = null;

        foreach ($endpoints as $url) {
            try {
                $res = Http::withoutVerifying()
                    ->timeout(180)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                        'Accept'     => '*/*'
                    ])
                    ->asForm()
                    ->post($url, [
                        'data' => $overpassQuery
                    ]);

                if ($res->successful()) {
                    $json = $res->json();
                    if (!empty($json) && isset($json['elements'])) {
                        $apiData = $json;
                        break;
                    }
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        if (empty($apiData)) {
            return response()->json([
                'status'  => false,
                'message' => 'Overpass servers timed out or busy. Please try again.',
            ], 504);
        }

        $elements = $apiData['elements'] ?? [];

        // 6. Response array prepare karein
        $townsList = [];
        $uniqueCheck = [];

        foreach ($elements as $item) {
            $name = $item['tags']['name'] ?? $item['tags']['name:en'] ?? null;
            if (!$name) {
                continue;
            }

            $lat = $item['lat'] ?? ($item['center']['lat'] ?? null);
            $lon = $item['lon'] ?? ($item['center']['lon'] ?? null);

            if ($lat === null || $lon === null) {
                continue;
            }

            $key = strtolower(trim($name)) . '_' . round((float)$lat, 3) . '_' . round((float)$lon, 3);
            if (isset($uniqueCheck[$key])) {
                continue;
            }
            $uniqueCheck[$key] = true;

            $townsList[] = [
                'town_name'  => $name,
                'latitude'   => (float) $lat,
                'longitude'  => (float) $lon,
                'place_type' => $item['tags']['place'] ?? 'town'
            ];
        }

        return response()->json([
            'status'    => true,
            'city_name' => $cityName,
            'total'     => count($townsList),
            'data'      => $townsList
        ], 200);

    } catch (Exception $e) {
        return response()->json([
            'status'  => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}
}