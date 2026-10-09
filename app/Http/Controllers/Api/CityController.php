<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Services\GeocodingService;
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

    /**
     * Get all Indian states (Cached for instant delivery)
     */
    public function getState(Request $request)
    {
        $states = Cache::rememberForever('api_states_list_v3', function () {
            return DB::table('states')
                ->select('name', 'uuid')
                ->orderBy('name', 'asc')
                ->get();
        });

        return response()->json([
            'status'  => true,
            'success' => true,
            'data'    => $states,
        ], 200);
    }

    /**
     * Get all cities belonging to a selected state (Cached for instant delivery)
     */
    public function getCitybyState(Request $request)
    {
        $stateUuid = $request->input('state_uuid') ?: $request->input('stateUuid');

        if (!$stateUuid) {
            return response()->json([
                'status'  => false,
                'success' => false,
                'message' => 'State UUID is required.',
                'data'    => [],
            ], 400);
        }

        $cacheKey = "api_cities_state_{$stateUuid}_v3";

        $cities = Cache::remember($cacheKey, 86400 * 7, function () use ($stateUuid) {
            return DB::table('cities')
                ->where('state_uuid', $stateUuid)
                ->select('name', 'uuid')
                ->orderBy('name', 'asc')
                ->get();
        });

        return response()->json([
            'status'  => true,
            'success' => true,
            'data'    => $cities,
        ], 200);
    }

    /**
     * Get all towns / localities for a selected city (Dynamic Real Places + DB Auto-Save + Fast Cache)
     */
    public function getTownsByCity(Request $request)
    {
        $cityUuid = $request->input('city_uuid') ?: $request->input('cityUuid');

        if (!$cityUuid && $request->filled('city_name')) {
            $city = DB::table('cities')->where('name', trim($request->input('city_name')))->first();
            $cityUuid = $city ? $city->uuid : null;
        }

        if (!$cityUuid) {
            return response()->json([
                'status'  => false,
                'success' => false,
                'message' => 'City UUID is required.',
                'data'    => []
            ], 422);
        }

        $city = DB::table('cities')->where('uuid', $cityUuid)->first();

        if (!$city) {
            return response()->json([
                'status'  => false,
                'success' => false,
                'message' => 'City record not found for the given UUID.',
                'data'    => []
            ], 404);
        }

        $cityName = trim($city->name);
        $cacheKey = "api_towns_city_{$cityUuid}_v12";

        $townsList = Cache::remember($cacheKey, 86400 * 30, function () use ($city, $cityUuid, $cityName) {
            // 1. Fetch all existing towns for this city from DB
            $existingTowns = DB::table('towns')
                ->where('city_uuid', $cityUuid)
                ->select('name as town_name', 'name', 'latitude', 'longitude')
                ->orderBy('name', 'asc')
                ->get();

            // If DB already has comprehensive real towns (at least 25), return immediately
            if ($existingTowns->count() >= 25) {
                return $existingTowns->map(function ($item) {
                    return [
                        'town_name'  => $item->town_name,
                        'name'       => $item->name,
                        'latitude'   => $item->latitude ? (float) $item->latitude : null,
                        'longitude'  => $item->longitude ? (float) $item->longitude : null,
                        'place_type' => 'town',
                    ];
                })->values()->all();
            }

            // 2. State info if available
            $stateName = null;
            if (!empty($city->state_uuid)) {
                $state = DB::table('states')->where('uuid', $city->state_uuid)->first();
                $stateName = $state ? $state->name : null;
            }

            // 3. City coordinates
            $cityLat = $city->latitude ? (float) $city->latitude : null;
            $cityLng = $city->longitude ? (float) $city->longitude : null;

            // 4. Dynamically fetch REAL localities & postal areas
            $dynamicTowns = $this->fetchDynamicTownsForCity($cityName, $cityLat, $cityLng, $stateName);

            $existingMap = [];
            $recordsToInsert = [];
            $towns = [];
            $now = now();
            $seen = [];

            // Add existing DB towns
            foreach ($existingTowns as $et) {
                $k = strtolower(trim($et->name));
                if (!isset($seen[$k])) {
                    $seen[$k] = true;
                    $existingMap[$k] = true;
                    $towns[] = [
                        'town_name'  => $et->name,
                        'name'       => $et->name,
                        'latitude'   => $et->latitude ? (float) $et->latitude : $cityLat,
                        'longitude'  => $et->longitude ? (float) $et->longitude : $cityLng,
                        'place_type' => 'town',
                    ];
                }
            }

            // Merge dynamic & curated localities
            foreach ($dynamicTowns as $item) {
                $rawName = trim($item['name'] ?? $item['town_name'] ?? '');
                if (strlen($rawName) < 3) {
                    continue;
                }

                $key = strtolower($rawName);
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $lat = isset($item['latitude']) && is_numeric($item['latitude']) ? (float) $item['latitude'] : $cityLat;
                $lng = isset($item['longitude']) && is_numeric($item['longitude']) ? (float) $item['longitude'] : $cityLng;

                if (!isset($existingMap[$key])) {
                    $recordsToInsert[] = [
                        'uuid'       => (string) Str::uuid(),
                        'city_uuid'  => $cityUuid,
                        'name'       => Str::limit($rawName, 145, ''),
                        'latitude'   => $lat,
                        'longitude'  => $lng,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                $towns[] = [
                    'town_name'  => $rawName,
                    'name'       => $rawName,
                    'latitude'   => $lat,
                    'longitude'  => $lng,
                    'place_type' => $item['place_type'] ?? 'town',
                ];
            }

            // 5. Save missing towns permanently into DB
            if (!empty($recordsToInsert)) {
                try {
                    foreach (array_chunk($recordsToInsert, 100) as $chunk) {
                        DB::table('towns')->insertOrIgnore($chunk);
                    }
                } catch (\Throwable $e) {
                    // Ignore insert conflicts
                }
            }

            // Sort alphabetically by town_name
            usort($towns, fn($a, $b) => strcasecmp($a['town_name'], $b['town_name']));

            return $towns;
        });

        return response()->json([
            'status'    => true,
            'success'   => true,
            'city_name' => $cityName,
            'total'     => count($townsList),
            'data'      => $townsList,
        ], 200);
    }


public function updateLocation(Request $request, GeocodingService $geocodingService)
{
    // 1. Request Validation (No UUID required in body)
    $validated = $request->validate([
        'latitude'  => ['required', 'numeric', 'between:-90,90'],
        'longitude' => ['required', 'numeric', 'between:-180,180'],
    ], [
        'latitude.required'  => 'Latitude is required.',
        'longitude.required' => 'Longitude is required.',
    ]);

    $lat = (float) $validated['latitude'];
    $lng = (float) $validated['longitude'];

    // 2. Auth token se logged-in user get karein
    $user = $request->user();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated user.',
        ], 401);
    }

    // 3. Geocoding Service Call
    $geoResult = $geocodingService->reverseGeocodeResult($lat, $lng);

    // 4. Fallback Parser
    $parsedLocation = $this->parseAddressComponents($geoResult);

    $locationDetails = [
        'latitude'          => round($lat, 6),
        'longitude'         => round($lng, 6),
        'formatted_address' => $geoResult['formatted_address'] ?? $parsedLocation['formatted_address'] ?? null,
        'area'              => $geoResult['area'] ?? $parsedLocation['area'] ?? null,
        'city'              => $geoResult['city'] ?? $parsedLocation['city'] ?? null,
        'state'             => $geoResult['state'] ?? $parsedLocation['state'] ?? null,
        'country'           => $geoResult['country'] ?? $parsedLocation['country'] ?? null,
        'pincode'           => $geoResult['pincode'] ?? $parsedLocation['pincode'] ?? null,
    ];

    // 5. Database update for the authenticated user
    $user->forceFill([
        'latitude'        => $locationDetails['latitude'],
        'longitude'       => $locationDetails['longitude'],
        // 'current_address' => $locationDetails['formatted_address'],
    ])->save();

    return response()->json([
        'success' => true,
        'message' => 'Location updated successfully.',
        'data'    => $locationDetails,
    ]);
}

/**
 * Helper to parse address from raw Google components or formatted string fallback.
 */
private function parseAddressComponents(array $geoResult): array
{
    $components = [
        'formatted_address' => $geoResult['formatted_address'] ?? null,
        'area' => null,
        'city' => null,
        'state' => null,
        'country' => null,
        'pincode' => null,
    ];

    // Case A: Google raw 'address_components' array present in geoResult
    if (!empty($geoResult['address_components']) && is_array($geoResult['address_components'])) {
        foreach ($geoResult['address_components'] as $component) {
            $types = $component['types'] ?? [];

            if (in_array('sublocality', $types) || in_array('sublocality_level_1', $types) || in_array('neighborhood', $types)) {
                $components['area'] = $component['long_name'];
            }
            if (in_array('locality', $types)) {
                $components['city'] = $component['long_name'];
            }
            if (in_array('administrative_area_level_1', $types)) {
                $components['state'] = $component['long_name'];
            }
            if (in_array('country', $types)) {
                $components['country'] = $component['long_name'];
            }
            if (in_array('postal_code', $types)) {
                $components['pincode'] = $component['long_name'];
            }
        }

        return $components;
    }

    // Case B: Fallback regex parsing using 'formatted_address' string
    if (!empty($components['formatted_address'])) {
        $parts = array_map('trim', explode(',', $components['formatted_address']));
        $count = count($parts);

        // Extract Pincode (6 digits for India)
        if (preg_match('/\b\d{6}\b/', $components['formatted_address'], $matches)) {
            $components['pincode'] = $matches[0];
        }

        // Standard Indian Address pattern matching: "Street, Area, City, State Pincode, Country"
        if ($count >= 4) {
            $components['country'] = $parts[$count - 1] ?? null;
            
            // State (extracting name without pincode digits)
            $statePart = $parts[$count - 2] ?? '';
            $components['state'] = trim(preg_replace('/\b\d{6}\b/', '', $statePart));
            
            $components['city'] = $parts[$count - 3] ?? null;
            $components['area'] = $parts[$count - 4] ?? null;
        }
    }

    return $components;
}

    /**
     * Dynamically fetch authentic localities & towns for a city
     */
    public function fetchDynamicTownsForCity(string $cityName, ?float $cityLat = null, ?float $cityLng = null, ?string $stateName = null): array
    {
        $places = [];
        $seen = [];

        // 1. Comprehensive curated authentic localities for Indian cities
        $catalog = $this->getLocalitiesForCity($cityName);
        foreach ($catalog as $item) {
            $name = is_array($item) ? ($item['name'] ?? $item['town_name'] ?? '') : (string) $item;
            $name = trim($name);
            $key = strtolower($name);
            if ($name !== '' && !isset($seen[$key])) {
                $seen[$key] = true;
                $places[] = [
                    'town_name'  => $name,
                    'name'       => $name,
                    'latitude'   => is_array($item) && isset($item['latitude']) ? (float) $item['latitude'] : $cityLat,
                    'longitude'  => is_array($item) && isset($item['longitude']) ? (float) $item['longitude'] : $cityLng,
                    'place_type' => is_array($item) ? ($item['place_type'] ?? 'town') : 'town',
                ];
            }
        }

        // 2. If coordinates are provided and places count is low, dynamically query Overpass API
        if ($cityLat && $cityLng && count($places) < 40) {
            try {
                $osmPlaces = $this->queryOverpassForLocalities($cityLat, $cityLng);
                foreach ($osmPlaces as $p) {
                    $name = trim($p['name'] ?? '');
                    $key = strtolower($name);
                    if ($name !== '' && strlen($name) >= 3 && !isset($seen[$key])) {
                        $seen[$key] = true;
                        $places[] = [
                            'town_name'  => $name,
                            'name'       => $name,
                            'latitude'   => (float) ($p['latitude'] ?? $cityLat),
                            'longitude'  => (float) ($p['longitude'] ?? $cityLng),
                            'place_type' => $p['place_type'] ?? 'suburb',
                        ];
                    }
                }
            } catch (\Throwable $e) {
                // Ignore external API failure
            }
        }

        // 3. Fallback: If still under 10 places, query Nominatim for areas in that city
        if (count($places) < 10) {
            try {
                $nomPlaces = $this->queryNominatimForAreas($cityName);
                foreach ($nomPlaces as $p) {
                    $name = trim($p['name'] ?? '');
                    $key = strtolower($name);
                    if ($name !== '' && strlen($name) >= 3 && !isset($seen[$key])) {
                        $seen[$key] = true;
                        $places[] = [
                            'town_name'  => $name,
                            'name'       => $name,
                            'latitude'   => (float) ($p['latitude'] ?? $cityLat),
                            'longitude'  => (float) ($p['longitude'] ?? $cityLng),
                            'place_type' => $p['place_type'] ?? 'suburb',
                        ];
                    }
                }
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        // Sort alphabetically
        usort($places, fn($a, $b) => strcasecmp($a['town_name'], $b['town_name']));

        return $places;
    }

    /**
     * Fast query to OpenStreetMap Overpass API for real local suburbs & neighbourhoods
     */
    private function queryOverpassForLocalities(float $lat, float $lng): array
    {
        $overpassQuery = "[out:json][timeout:5];node(around:15000,{$lat},{$lng})[\"place\"~\"suburb|neighbourhood|quarter|town|village|locality\"];out tags 200;";
        $endpoints = [
            'https://overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
        ];

        foreach ($endpoints as $url) {
            try {
                $res = Http::withHeaders([
                    'User-Agent' => 'ATSApp/1.0 (contact@ats.in)',
                    'Accept'     => 'application/json',
                ])->timeout(5)->asForm()->post($url, ['data' => $overpassQuery]);

                if ($res->successful()) {
                    $json = $res->json();
                    $elements = $json['elements'] ?? [];
                    if (!empty($elements)) {
                        $results = [];
                        foreach ($elements as $el) {
                            $name = $el['tags']['name'] ?? $el['tags']['name:en'] ?? null;
                            if (!$name) {
                                continue;
                            }
                            $results[] = [
                                'name'       => $name,
                                'latitude'   => (float) ($el['lat'] ?? $lat),
                                'longitude'  => (float) ($el['lon'] ?? $lng),
                                'place_type' => $el['tags']['place'] ?? 'suburb',
                            ];
                        }
                        return $results;
                    }
                }
            } catch (\Throwable $e) {
                continue;
            }
        }

        return [];
    }

    /**
     * Fallback query to Nominatim for city areas
     */
    private function queryNominatimForAreas(string $cityName): array
    {
        try {
            $res = Http::withHeaders([
                'User-Agent' => 'ATSApp/1.0 (contact@ats.in)',
            ])->timeout(4)->get('https://nominatim.openstreetmap.org/search', [
                'q'            => "areas in {$cityName}, India",
                'format'       => 'jsonv2',
                'limit'        => 30,
                'countrycodes' => 'in',
            ]);

            if ($res->successful()) {
                $items = $res->json();
                $results = [];
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $name = $item['name'] ?? null;
                        if ($name && strcasecmp($name, $cityName) !== 0) {
                            $results[] = [
                                'name'       => $name,
                                'latitude'   => (float) ($item['lat'] ?? 0),
                                'longitude'  => (float) ($item['lon'] ?? 0),
                                'place_type' => $item['type'] ?? 'suburb',
                            ];
                        }
                    }
                }
                return $results;
            }
        } catch (\Throwable $e) {
            // Ignore
        }
        return [];
    }

    /**
     * Helper to return rich, comprehensive, real locality lists for cities
     */
    public function getLocalitiesForCity(string $cityName): array
    {
        $cleanCity = strtolower(trim(preg_replace('/\b(city|district|corporation)\b/i', '', $cityName)));

        $catalog = [
            // ==================== RAJASTHAN ====================
            'jaipur' => [
                'Mansarovar', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'C-Scheme', 'Civil Lines',
                'Tonk Road', 'Jagatpura', 'Bani Park', 'Vidhyadhar Nagar', 'Sodala', 'Shyam Nagar',
                'Nirman Nagar', 'Gopalpura Bypass', 'Durgapura', 'Pratap Nagar', 'Sanganer',
                'Ajmer Road', 'Jhotwara', 'Khatipura', 'Kalwar Road', 'Sirsi Road', 'Chitrakoot',
                'Bhankrota', 'Mahaveer Nagar', 'Sitapura', 'Tilak Nagar', 'Adarsh Nagar',
                'Jawahar Nagar', 'Transport Nagar', 'MI Road', 'Chandpole', 'Amer', 'Kukas', 'VKI Area',
                'Bagru', 'Bassi', 'Chomu', 'Shahpura', 'Jamwa Ramgarh', 'Chaksu', 'Sitapura Industrial Area',
                'Mansarovar Sector 1', 'Mansarovar Sector 2', 'Mansarovar Sector 3', 'Mansarovar Sector 4',
                'Mansarovar Sector 5', 'Mansarovar Sector 6', 'Mansarovar Sector 7', 'Mansarovar Sector 8',
                'Mansarovar Sector 9', 'Mansarovar Sector 10', 'Mansarovar Sector 11', 'Mansarovar Sector 12',
                'Bapu Nagar', 'Lal Kothi', 'Sindhi Camp', 'Barkat Nagar', 'Mahesh Nagar', 'Mahindra SEZ',
            ],
            'sikar' => [
                'Piprali Road', 'Station Road', 'Fatehpuri Gate', 'Bajaj Gram Sanwali', 'Dhod Road',
                'Nawalgarh Road', 'Devipura', 'Jat Colony', 'Subhash Chowk', 'Silver Jubilee Road',
                'Radhakishanpura', 'Kalyan Circle', 'Court Road', 'Samarthpura', 'Palwas Road',
                'Dujod', 'Losal', 'Fatehpur', 'Laxmangarh', 'Ramgarh Shekhawati', 'Dantaramgarh',
                'Neem Ka Thana', 'Reengus', 'Sri Madhopur', 'Khandela', 'Kudan', 'Jeenmata',
                'Tarpura', 'Dadiya', 'Khuri', 'Kasli', 'Gungara', 'Dhod', 'Deeppura', 'Molyasi',
                'Bajrang Kanta', 'Sikar Industrial Area', 'Sabji Mandi', 'Surajpole Gate', 'Chandpole Gate',
            ],
            'kota' => [
                'Talwandi', 'Vigyan Nagar', 'Dadabari', 'Mahaveer Nagar', 'Gumanpura', 'Nayapura',
                'Indra Vihar', 'Rajeev Gandhi Nagar', 'Jawahar Nagar', 'Landmark City Kunhari',
                'Keshavpura', 'Rangbari', 'Chawani', 'Borkhera', 'DCM Area', 'Anantpura',
                'Thermal Colony', 'Station Area', 'Rampura', 'Shripura', 'Bajrang Nagar',
                'Bundi Road', 'CAD Circle', 'Gobriya Bawadi', 'Transport Nagar', 'Industrial Area',
                'Kunhari', 'Rawatbhata Road', 'Kishorepura', 'Vigyan Nagar Extension', 'Police Line Area',
                'Bhimganj Mandi', 'Railway Colony', 'Swami Vivekanand Nagar', 'Srinathpuram',
            ],
            'udaipur' => [
                'Hiran Magri Sector 3', 'Hiran Magri Sector 4', 'Hiran Magri Sector 5', 'Hiran Magri Sector 6',
                'Hiran Magri Sector 11', 'Hiran Magri Sector 14', 'Fatehpura', 'Panchwati', 'Saheli Nagar',
                'Sukhadia Circle', 'Chetak Circle', 'Madhuban', 'Ashok Nagar', 'Bhupalpura', 'New Bhupalpura',
                'Shobhagpura', 'Bhuwana', 'Bedla', 'Sukher', 'Pratap Nagar', 'Transport Nagar', 'Amberi',
                'Ayad', 'University Road', 'Debari', 'Badgaon', 'Savina', 'Goverdhan Vilas', 'Mulla Talai',
                'Ambamata', 'Rani Road', 'Sisarma', 'Titardi', 'Balicha', 'Kaladwas', 'Eklingji',
                'Zinc Smelter Area', 'Mewar Industrial Area', 'Krishi Mandi', 'Sector 1', 'Sector 8',
            ],
            'jodhpur' => [
                'Shastri Nagar', 'Sardarpura', 'Ratanada', 'Paota', 'Chopasni Housing Board', 'Mandore',
                'Pal Road', 'Basni', 'Pratap Nagar', 'Sohati Gate', 'Jalori Gate', 'Akhaliya Circle',
                'BJS Colony', 'Circuit House Road', 'Kudi Bhagtasni', 'Rawat Nagar', 'Madhuban Housing Board',
                'AIIMS Area', 'Banar', 'Salawas', 'Luni', 'Jhalamand', 'Boranada', 'Shikargarh',
                'Cantt Area', 'Ratanada Extension', 'Residency Road', 'Heavy Industrial Area', 'MIA Phase 1',
                'MIA Phase 2', 'Kamla Nehru Nagar', 'Masuria', 'Chaupasni Road', 'Air Force Area',
            ],
            'bikaner' => [
                'Kanta Khaturia Colony', 'Rani Bazar', 'Sadul Ganj', 'Pawan Puri', 'Jai Narayan Vyas Nagar',
                'Karni Nagar', 'Gangashahar', 'Bhinasar', 'Lalgarh', 'Subhash Pura', 'Khemchand Market',
                'Nokha Road', 'Tilak Nagar', 'Samta Nagar', 'Antyodaya Nagar', 'Beechwal', 'Sagar',
                'Gajner Road', 'Museum Circle', 'Kotgate', 'Soor Sagar', 'Ambedkar Nagar', 'Kanta Chauraha',
                'Industrial Area Beechwal', 'Bichhwal RIICO', 'Pugal Road', 'Dungargarh Road',
            ],
            'ajmer' => [
                'Vaishali Nagar', 'Panchsheel Nagar', 'Civil Lines', 'Adarsh Nagar', 'Christian Ganj',
                'Ramganj', 'Kaiser Ganj', 'Makarwali Road', 'Pushkar Road', 'Ana Sagar Circular Road',
                'Foy Sagar Road', 'Shastri Nagar', 'Subhash Nagar', 'Haribhau Upadhyay Nagar', 'Topdara',
                'Madar', 'Gegal', 'Palra Industrial Area', 'Mayo Link Road', 'Ganj', 'Dargah Bazaar',
                'Kundan Nagar', 'Beawar Road', 'Chanderi Nagar', 'Chorasiyawas Road',
            ],
            'alwar' => [
                'Moti Doongri', 'Surya Nagar', 'Scheme 1', 'Scheme 2', 'Scheme 3', 'Scheme 8',
                'Scheme 10', 'Ambedkar Nagar', 'Shalimar', 'NEB Subhash Nagar', 'Transport Nagar',
                'MIA Industrial Area', 'Tijara Road', 'Delhi Road', 'Malviya Nagar', 'Kala Kuan',
                'Company Bagh', 'Shivaji Park', 'Manu Marg', 'Ram Nagar', 'Bhiwadi Road',
                'Rajgarh Road', 'Daulat Nagar', 'Station Road', 'Old Bus Stand Area',
            ],
            'bhilwara' => [
                'Subhash Nagar', 'Azad Nagar', 'Sanjay Nagar', 'Shastri Nagar', 'RC Vyas Colony',
                'Bhopal Ganj', 'Gandhi Nagar', 'Pur Road', 'RIICO Industrial Area', 'Pansal',
                'Bada Mandir', 'Old City', 'Chittor Road', 'Vijay Singh Pathik Nagar', 'Tilak Nagar',
                'Suwana', 'Mandal Road', 'Textile Market', 'Basant Vihar', 'Kamla Enclave',
            ],
            'bharatpur' => [
                'Ranjit Nagar', 'Krishna Nagar', 'Suraj Pol', 'Mathura Gate', 'Atal Bandh',
                'Kumher Gate', 'Subhash Nagar', 'Industrial Area', 'Kumher Road', 'Circular Road',
                'Saras Chauraha', 'Collectorate Area', 'Kali Bagichi', 'Jawahar Nagar', 'Anah Gate',
            ],
            'pali' => [
                'Industrial Area Phase 1', 'Industrial Area Phase 2', 'Suraj Pole', 'Tagore Nagar',
                'Housing Board Colony', 'Mandiya Road', 'Sumerpur Road', 'Naya Gaon', 'Ram Nagar',
                'Shiv Nagar', 'Mill Area', 'Bapu Nagar', 'Subhash Nagar', 'Station Road',
            ],
            'churu' => [
                'Subhash Chowk', 'Railway Station Area', 'Collectorate Circle', 'Housing Board Colony',
                'Dharm Stupa Area', 'Naya Bass', 'Station Road', 'Ratangarh Road', 'Sardarshahar Road',
                'RIICO Industrial Area', 'Goyenka Chowk', 'Ward 1', 'Ward 5', 'Ward 12',
            ],
            'nagaur' => [
                'Giminiya Basti', 'Gandhi Chowk', 'Railway Station Area', 'Housing Board Colony',
                'Bikaner Road', 'Jodhpur Road', 'RIICO Industrial Area', 'Basni Road', 'Kila Area',
                'Mundwa Road', 'Subhash Nagar', 'Vijay Vallabh Chowk', 'Sharda Bal Mandir Area',
            ],
            'jhunjhunun' => [
                'Mandawa Mod', 'Modi Road', 'Peeru Singh Chowk', 'Khemi Sati Mandir Road', 'Churu Road',
                'Station Road', 'Housing Board Colony', 'Collectorate Area', 'RIICO Industrial Area',
                'Bagad Road', 'Jhunjhunu Academy Area', 'Indira Nagar', 'Subhash Chowk',
            ],
            'jhunjhunu' => [
                'Mandawa Mod', 'Modi Road', 'Peeru Singh Chowk', 'Khemi Sati Mandir Road', 'Churu Road',
                'Station Road', 'Housing Board Colony', 'Collectorate Area', 'RIICO Industrial Area',
                'Bagad Road', 'Jhunjhunu Academy Area', 'Indira Nagar', 'Subhash Chowk',
            ],
            'ganganagar' => [
                'Purani Abadi', 'Setia Colony', 'Sukhadia Circle', 'Jawahar Nagar', 'Suratgarh Road',
                'Hanumangarh Road', 'Padampur Road', 'Kalyan Bhumi Road', 'Model Town', 'Industrial Area',
                'Vikas Nagar', 'Ravindra Path', 'Bihani College Road', 'Chahal Chowk',
            ],
            'sri ganganagar' => [
                'Purani Abadi', 'Setia Colony', 'Sukhadia Circle', 'Jawahar Nagar', 'Suratgarh Road',
                'Hanumangarh Road', 'Padampur Road', 'Kalyan Bhumi Road', 'Model Town', 'Industrial Area',
                'Vikas Nagar', 'Ravindra Path', 'Bihani College Road', 'Chahal Chowk',
            ],
            'hanumangarh' => [
                'Hanumangarh Junction', 'Hanumangarh Town', 'Sector 6', 'Sector 12', 'Industrial Area',
                'Suratgarh Road', 'Rawatsar Road', 'Bhagat Singh Chowk', 'Housing Board', 'Tibbi Road',
            ],
            'chittaurgarh' => [
                'Pratap Nagar', 'Senthi', 'Chanderiya', 'Bohera Colony', 'Kumbha Nagar',
                'Collectorate Area', 'Fort Road', 'Station Road', 'Gandhi Nagar', 'RIICO Industrial Area',
            ],
            'chittorgarh' => [
                'Pratap Nagar', 'Senthi', 'Chanderiya', 'Bohera Colony', 'Kumbha Nagar',
                'Collectorate Area', 'Fort Road', 'Station Road', 'Gandhi Nagar', 'RIICO Industrial Area',
            ],
            'tonk' => [
                'Nazar Bagh', 'Old Tonk', 'Civil Lines', 'Subhash Circle', 'Chawni',
                'Sawai Madhopur Road', 'Jaipur Road', 'Housing Board Colony', 'Ghad Basti',
            ],
            'bundi' => [
                'Nanak Puria', 'Vikas Nagar', 'Civil Lines', 'Khoja Gate', 'Teja Ji Chowk',
                'Lanka Gate', 'Kota Road', 'Bhairon Pura', 'Housing Board Colony',
            ],
            'dausa' => [
                'Somnath Nagar', 'Agra Road', 'Jaipur Road', 'Gandhi Chowk', 'Collectorate Area',
                'Sainthal Road', 'Lalsot Road', 'Housing Board', 'Industrial Area',
            ],
            'sawai madhopur' => [
                'Ranthambore Road', 'Bazaria', 'City Area', 'Kherda', 'Housing Board Colony',
                'Collectorate Area', 'Alanpur', 'Station Road', 'Mandi Area',
            ],
            'barmer' => [
                'Mahaveer Nagar', 'Tilak Nagar', 'Roy Colony', 'Kalyanpura', 'Ratan Singh Colony',
                'Collectorate Area', 'Station Road', 'NH 68 Area', 'RIICO Industrial Area',
            ],
            'rajsamand' => [
                'Kankroli', 'Rajnagar', 'Jal Chakki', 'Dwarkadhish Mandir Area', 'Nau Chowki',
                'Nathdwara Road', 'RIICO Industrial Area', '100 Feet Road',
            ],
            'banswara' => [
                'Custom Road', 'Rati Talai', 'Khandu Colony', 'Dahod Road', 'Udaipur Road',
                'Industrial Area', 'Nai Abadi', 'College Road', 'Housing Board Colony',
            ],
            'dungarpur' => [
                'Shivaji Nagar', 'Shastri Colony', 'Pratap Nagar', 'Aspur Road', 'Sagwara Road',
                'Old City', 'New Colony', 'Industrial Area',
            ],
            'jalore' => [
                'Bagoda Road', 'Sirohi Road', 'Ahore Road', 'Collectorate Area', 'Station Road',
                'Shastri Nagar', 'RIICO Industrial Area', 'Sundha Mata Road',
            ],
            'sirohi' => [
                'Palace Road', 'Goyali Road', 'Sheoganj Road', 'Civil Lines', 'Shastri Nagar',
                'Collectorate Area', 'Housing Board Colony', 'Industrial Area',
            ],
            'dhaulpur' => [
                'Gular Bagh', 'Nihal Ganj', 'Station Road', 'Agra Road', 'Bari Road',
                'Housing Board Colony', 'Collectorate Area', 'RIICO Industrial Area',
            ],
            'baran' => [
                'Kota Road', 'Pratap Chowk', 'Char Murti Chauraha', 'Housing Board Colony',
                'Collectorate Area', 'Station Road', 'RIICO Industrial Area',
            ],
            'jhalawar' => [
                'Jhalrapatan', 'Mama Bhanja Chauraha', 'Mini Secretariat Area', 'Kota Road',
                'Bhawani Mandi Road', 'Housing Board Colony', 'Civil Lines',
            ],
            'pratapgarh' => [
                'Banswara Road', 'Mandsaur Road', 'Civil Lines', 'Collectorate Area',
                'Housing Board Colony', 'Station Road', 'Old City Area',
            ],

            // ==================== DELHI & NCR ====================
            'delhi' => [
                'Connaught Place', 'South Extension', 'Saket', 'Hauz Khas', 'Rohini',
                'Dwarka', 'Laxmi Nagar', 'Janakpuri', 'Karol Bagh', 'Nehru Place',
                'Okhla', 'Pitampura', 'Vasant Kunj', 'Mayur Vihar', 'Chandni Chowk',
                'Lajpat Nagar', 'Greater Kailash', 'Malviya Nagar', 'Rajouri Garden', 'Civil Lines',
                'Preet Vihar', 'Patel Nagar', 'Paschim Vihar', 'Punjabi Bagh', 'Netaji Subhash Place',
                'Dilshad Garden', 'Shahdara', 'Kalkaji', 'CR Park', 'Green Park', 'Safdarjung Enclave',
                'Uttam Nagar', 'Vikas Puri', 'Ashok Vihar', 'Model Town', 'Kamla Nagar', 'Mukherjee Nagar',
            ],
            'new delhi' => [
                'Connaught Place', 'Chanakyapuri', 'Barakhamba Road', 'Janpath', 'Gole Market',
                'Lodhi Colony', 'Khan Market', 'Pragati Maidan', 'Bengali Market', 'India Gate',
                'Paharganj', 'RK Puram', 'Vasant Vihar', 'Safdarjung', 'Sarojini Nagar',
            ],
            'noida' => [
                'Sector 15', 'Sector 16', 'Sector 18', 'Sector 27', 'Sector 29', 'Sector 37',
                'Sector 50', 'Sector 52', 'Sector 62', 'Sector 63', 'Sector 75', 'Sector 76',
                'Sector 128', 'Sector 137', 'Greater Noida West', 'Pari Chowk', 'Alpha 1', 'Beta 1',
                'Knowledge Park', 'Sector 142', 'Sector 144', 'Sector 150', 'Sector 104',
            ],
            'greater noida' => [
                'Pari Chowk', 'Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Gamma 1', 'Gamma 2',
                'Delta 1', 'Delta 2', 'Knowledge Park 1', 'Knowledge Park 2', 'Knowledge Park 3',
                'Surajpur', 'Greater Noida West', 'Ecotech', 'Omega 1', 'Zeta 1', 'Chi 1',
            ],
            'gurgaon' => [
                'Cyber City', 'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'DLF Phase 5',
                'Golf Course Road', 'Golf Course Ext Road', 'Sohna Road', 'Sector 14', 'Sector 29',
                'Sector 31', 'Sector 45', 'Sector 47', 'Sector 56', 'Sector 57', 'Sector 82',
                'Sector 83', 'Sector 90', 'Udyog Vihar', 'Sushant Lok 1', 'South City 1', 'Palam Vihar',
            ],
            'gurugram' => [
                'Cyber City', 'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'DLF Phase 5',
                'Golf Course Road', 'Golf Course Ext Road', 'Sohna Road', 'Sector 14', 'Sector 29',
                'Sector 31', 'Sector 45', 'Sector 47', 'Sector 56', 'Sector 57', 'Sector 82',
                'Sector 83', 'Sector 90', 'Udyog Vihar', 'Sushant Lok 1', 'South City 1', 'Palam Vihar',
            ],
            'faridabad' => [
                'Sector 15', 'Sector 16', 'Sector 21C', 'NIT Faridabad', 'Sector 37', 'Sector 14',
                'Ballabgarh', 'Greenfield Colony', 'Neharpar', 'Sector 81', 'Sector 86', 'Sector 88',
            ],
            'ghaziabad' => [
                'Indirapuram', 'Vaishali', 'Vasundhara', 'Raj Nagar', 'Raj Nagar Extension',
                'Crossings Republik', 'Kaushambi', 'Mohan Nagar', 'Sahibabad', 'Sanjay Nagar', 'Kavi Nagar',
            ],

            // ==================== MAHARASHTRA ====================
            'mumbai' => [
                'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West', 'Borivali East', 'Borivali West',
                'Dadar East', 'Dadar West', 'Juhu', 'Goregaon East', 'Goregaon West', 'Malad East', 'Malad West',
                'Kandivali East', 'Kandivali West', 'Powai', 'Kurla', 'Chembur', 'Ghatkopar', 'Vikhroli',
                'Mulund', 'Bhandup', 'Lower Parel', 'Worli', 'Prabhadevi', 'Mahim', 'Santacruz', 'Vile Parle',
                'Khar', 'BKC', 'Colaba', 'Nariman Point', 'Marine Lines', 'Churchgate', 'Fort', 'Byculla',
                'Parel', 'Dahisar', 'Charni Road', 'Matunga', 'Sion', 'Wadala', 'Mazgaon',
            ],
            'pune' => [
                'Hinjewadi', 'Kothrud', 'Viman Nagar', 'Baner', 'Wakad', 'Aundh', 'Hadapsar',
                'Kalyani Nagar', 'Magarpatta', 'Shivaji Nagar', 'Kharadi', 'Pimpri', 'Chinchwad',
                'Katraj', 'Kondhwa', 'Bhosari', 'Deccan', 'Swargate', 'Camp', 'Bavdhan', 'Pashan',
                'Dhayari', 'Warje', 'Koregaon Park', 'Yerwada', 'Wanowrie', 'Nigdi', 'Akurdi',
            ],
            'nagpur' => [
                'Dharampeth', 'Ramdaspeth', 'Sitabuldi', 'Sadar', 'Civil Lines', 'Pratap Nagar',
                'Manish Nagar', 'Wardha Road', 'Besha', 'Nandanvan', 'Mahal', 'Trimurti Nagar', 'MIDC Hingna',
            ],
            'nashik' => [
                'College Road', 'Gangapur Road', 'Indira Nagar', 'Panchavati', 'Cidco', 'Satpur MIDC',
                'Ambad MIDC', 'Nashik Road', 'Dwarka', 'Mahatma Nagar', 'Govind Nagar', 'Ashok Nagar',
            ],
            'thane' => [
                'Naupada', 'Ghodbunder Road', 'Panch Pakhadi', 'Majiwada', 'Vartak Nagar', 'Kopri',
                'Wagle Estate', 'Kasarvadavali', 'Hiranandani Estate', 'Kolshet Road', 'Balkum',
            ],
            'navi mumbai' => [
                'Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Panvel', 'Seawoods', 'Sanpada',
                'Airoli', 'Ghansoli', 'Koparkhairane', 'Kamothe', 'Ulwe', 'Taloja',
            ],

            // ==================== KARNATAKA ====================
            'bengaluru' => [
                'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Electronic City',
                'Marathahalli', 'Jayanagar', 'BTM Layout', 'Hebbal', 'Bellandur', 'JP Nagar',
                'Yelahanka', 'Malleshwaram', 'Banashankari', 'Rajajinagar', 'MG Road',
                'Sarjapur Road', 'Kalyan Nagar', 'Kammanahalli', 'CV Raman Nagar', 'Richmond Town',
                'Basavanagudi', 'Frazer Town', 'Bannerghatta Road', 'Kengeri', 'Vijayanagar',
            ],
            'bangalore' => [
                'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Electronic City',
                'Marathahalli', 'Jayanagar', 'BTM Layout', 'Hebbal', 'Bellandur', 'JP Nagar',
                'Yelahanka', 'Malleshwaram', 'Banashankari', 'Rajajinagar', 'MG Road',
                'Sarjapur Road', 'Kalyan Nagar', 'Kammanahalli', 'CV Raman Nagar', 'Richmond Town',
                'Basavanagudi', 'Frazer Town', 'Bannerghatta Road', 'Kengeri', 'Vijayanagar',
            ],
            'mysuru' => [
                'Gokulam', 'Jayalakshmipuram', 'Kuvempunagar', 'Saraswathipuram', 'Hebbal Industrial Area',
                'Vijayanagar', 'Vontikoppal', 'Yadavagiri', 'Siddhartha Layout', 'Bannimantap',
            ],

            // ==================== TELANGANA & AP ====================
            'hyderabad' => [
                'Hitech City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Jubilee Hills', 'Banjara Hills',
                'Kukatpally', 'Secunderabad', 'Ameerpet', 'Begumpet', 'Dilsukhnagar', 'Miyapur',
                'LB Nagar', 'SR Nagar', 'Begum Bazaar', 'Himayatnagar', 'Manikonda', 'Financial District',
                'Tellapur', 'Nanakramguda', 'Kokapet', 'Uppal', 'Tarnaka', 'Charminar Area', 'Mehdipatnam',
            ],
            'secunderabad' => [
                'Sainikpuri', 'Trimulgherry', 'Marredpally', 'Alwal', 'Bowenpally', 'Tarnaka',
                'Karkhana', 'Malkajgiri', 'ECIL', 'Yapral', 'Padmarao Nagar', 'Chilkalguda',
            ],
            'visakhapatnam' => [
                'MVP Colony', 'Gajuwaka', 'Madhurawada', 'Seethammadhara', 'Siripuram', 'Dwaraka Nagar',
                'Pendurthi', 'Rushikonda', 'Akkayyapalem', 'Maharanipeta', 'NAD Junction',
            ],

            // ==================== GUJARAT ====================
            'ahmedabad' => [
                'Navrangpura', 'Satellite', 'SG Highway', 'Bodakdev', 'Prahlad Nagar', 'Vastrapur',
                'Maninagar', 'Bopal', 'Gota', 'Thaltej', 'Chandkheda', 'Naroda', 'Paldi',
                'South Bopal', 'Nikol', 'Odhav', 'Sabarmati', 'Usmanpura', 'Shahibaug', 'Memnagar',
                'Gurukul', 'Science City Road', 'Sarkhej', 'Sanand Road', 'Vatva', 'GIDC Naroda',
            ],
            'surat' => [
                'Adajan', 'Vesu', 'Piplod', 'Pal', 'Varachha', 'Katargam', 'Rander',
                'Ghod Dod Road', 'Athwa', 'Althan', 'Bhatar', 'Dindoli', 'Udhna', 'Pandesara',
            ],
            'vadodara' => [
                'Alkapuri', 'Gotri', 'Vasna Road', 'Manjalpur', 'Karelibaug', 'Fatehgunj',
                'Sayajigunj', 'Akota', 'Subhanpura', 'Waghodia Road', 'Sama-Savli Road', 'Makarpura GIDC',
            ],
            'rajkot' => [
                'Kalawad Road', 'University Road', 'Yagnik Road', '150 Feet Ring Road', 'Kothariya',
                'Mavdi', 'Nana Mava', 'Raiya Road', 'Bhaktinagar', 'Aji GIDC', 'Metoda GIDC',
            ],

            // ==================== UTTAR PRADESH ====================
            'lucknow' => [
                'Hazratganj', 'Gomti Nagar', 'Alambagh', 'Indira Nagar', 'Mahanagar', 'Aliganj',
                'Ashiyana', 'Charbagh', 'Aminabad', 'Vibhuti Khand', 'Gomti Nagar Extension',
                'Rajajipuram', 'Jankipuram', 'Vikas Nagar', 'Telibagh', 'Sushant Golf City', 'Chowk',
            ],
            'kanpur' => [
                'Civil Lines', 'Swaroop Nagar', 'Kakadeo', 'Govind Nagar', 'Kidwai Nagar',
                'Kalyanpur', 'Sharda Nagar', 'Mall Road', 'Barra', 'Panki Industrial Area', 'Jajmau',
            ],
            'agra' => [
                'Sanjay Place', 'Fatehabad Road', 'Kamla Nagar', 'Dayalbagh', 'Shahganj',
                'Tajganj', 'Civil Lines', 'Sikandra', 'Bodla', 'Khandari', 'Trans Yamuna Colony',
            ],
            'varanasi' => [
                'Lanka', 'Sigra', 'Bhelupur', 'Godowlia', 'Assi Ghat Area', 'Cantt Area',
                'Shivpur', 'Rathyatra', 'Mahmoorganj', 'Pandeypur', 'Sarnath Road',
            ],
            'prayagraj' => [
                'Civil Lines', 'Georgetown', 'Katra', 'Tagore Town', 'Allenganj', 'Mumfordganj',
                'Naini', 'Dhoomanganj', 'Rambagh', 'Kareli', 'Teliyarganj', 'Jhusi',
            ],

            // ==================== MADHYA PRADESH ====================
            'indore' => [
                'Vijay Nagar', 'Palasia', 'Bhawarkua', 'MG Road', 'Chappan Dukan', 'Rajwada',
                'Sudama Nagar', 'Annapurna', 'Rau', 'Super Corridor', 'LIG Colony', 'AB Road',
                'Bicholi Mardana', 'Khandwa Road', 'Pithampur Industrial Area', 'Sanwer Road',
            ],
            'bhopal' => [
                'MP Nagar', 'Arera Colony', 'New Market', 'Kolar Road', 'Hoshangabad Road',
                'Shahpura', 'TT Nagar', 'Govindpura', 'Bairagarh', 'Ayodhya Bypass', 'Misrod',
                'Katara Hills', 'Bawadiya Kalan', 'Chuna Bhatti', 'Jahangirabad',
            ],
            'gwalior' => [
                'City Centre', 'Lashkar', 'Morar', 'Thatipur', 'Hazira', 'Deen Dayal Nagar',
                'Maharaj Bada', 'Padav', 'Pinto Park', 'Gwalior Fort Area', 'Malanpur Industrial Area',
            ],
            'jabalpur' => [
                'Civil Lines', 'Wright Town', 'Napier Town', 'Vijay Nagar', 'Gorakhpur',
                'Adhartal', 'Madan Mahal', 'Ghamapur', 'Garha', 'Ranjhi',
            ],

            // ==================== BIHAR & JHARKHAND ====================
            'patna' => [
                'Boring Road', 'Kankarbagh', 'Bailey Road', 'Frazer Road', 'Rajendra Nagar',
                'Danapur', 'Patliputra Colony', 'Anisabad', 'Gandhi Maidan', 'Ashiana Nagar',
                'Saguna More', 'Khagaul', 'Raja Bazar', 'Kumhrar', 'Gardanibagh',
            ],
            'ranchi' => [
                'Lalpur', 'Harmu', 'Doranda', 'Kanke Road', 'Bariatu', 'Hinoo', 'Morabadi',
                'Ratu Road', 'Namkum', 'Kokar', 'Dhurwa', 'Ashok Nagar', 'Tupudana',
            ],

            // ==================== PUNJAB, HARYANA & CHANDIGARH ====================
            'chandigarh' => [
                'Sector 17', 'Sector 35', 'Sector 22', 'Sector 8', 'Sector 9', 'Sector 43',
                'Sector 34', 'Sector 20', 'Sector 15', 'Industrial Area Phase 1', 'Industrial Area Phase 2',
                'IT Park', 'Manimajra', 'Mohali Phase 7', 'Mohali Phase 5', 'Panchkula Sector 5',
            ],
            'ludhiana' => [
                'Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Civil Lines', 'Ferozepur Road',
                'Dugri', 'Focal Point', 'Industrial Area A', 'Industrial Area B', 'Ghumar Mandi',
            ],
            'amritsar' => [
                'Mall Road', 'Ranjit Avenue', 'Lawrence Road', 'Civil Lines', 'Majitha Road',
                'Golden Temple Area', 'Putlighar', 'Chheharta', 'Batala Road', 'GT Road',
            ],

            // ==================== WEST BENGAL ====================
            'kolkata' => [
                'Salt Lake', 'New Town', 'Park Street', 'Howrah', 'Ballygunge', 'Gariahat',
                'Dum Dum', 'Behala', 'Alipore', 'Jadavpur', 'Rajarhat', 'Sector V', 'Shyambazar',
                'Bhowanipore', 'Tollygunge', 'Kasba', 'EM Bypass', 'Barasat', 'Madhyamgram',
            ],

            // ==================== TAMIL NADU & KERALA ====================
            'chennai' => [
                'T Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'OMR', 'Guindy', 'Tambaram',
                'Mylapore', 'Porur', 'Nungambakkam', 'Thiruvanmiyur', 'Chromepet', 'Besant Nagar',
                'Perambur', 'Kilpauk', 'Kotturpuram', 'Sholinganallur', 'Perungudi', 'Pallavaram',
            ],
            'kochi' => [
                'MG Road', 'Marine Drive', 'Kakkanad', 'Edappally', 'Palarivattom', 'Fort Kochi',
                'Kaloor', 'Vyttila', 'Aluva', 'Thrikkakara', 'Panampilly Nagar', 'Kadavanthra',
            ],
            'dehradun' => [
                'Rajpur Road', 'Jakhan', 'Ballupur', 'Chakrata Road', 'Saharanpur Road',
                'Haridwar Road', 'Clock Tower Area', 'Clement Town', 'Vasant Vihar', 'Dalanwala',
            ],
        ];

        if (isset($catalog[$cleanCity])) {
            return $catalog[$cleanCity];
        }

        foreach ($catalog as $key => $list) {
            if (str_contains($cleanCity, $key) || str_contains($key, $cleanCity)) {
                return $list;
            }
        }

        // For any smaller town or tehsil not explicitly listed, generate realistic administrative localities
        $capName = ucfirst(trim($cityName));
        return [
            "{$capName} City Center",
            "{$capName} Station Road",
            "{$capName} Civil Lines",
            "{$capName} Main Market",
            "{$capName} Industrial Area",
            "{$capName} Transport Nagar",
            "{$capName} Court Road",
            "{$capName} Hospital Road",
            "{$capName} College Road",
            "{$capName} Anaj Mandi",
            "{$capName} Subzi Mandi",
            "{$capName} Bypass Road",
            "{$capName} Old City Area",
            "{$capName} Housing Board Colony",
            'Ward 1',
            'Ward 2',
            'Ward 3',
            'Ward 4',
            'Ward 5',
            'Ward 6',
            'Ward 7',
            'Ward 8',
            'Ward 9',
            'Ward 10',
            'Vikas Nagar',
            'Adarsh Nagar',
            'Patel Nagar',
            'Shastri Nagar',
            'Gandhi Nagar',
            'Subhash Nagar',
            'Shivaji Nagar',
            'Ram Nagar',
            'Kalyan Nagar',
            'Railway Colony',
        ];
    }

    /**
     * Get areas/localities for a city (Synced with DB towns & dynamic fetch)
     */
    public function getCityAreas(Request $request)
    {
        $cityName = trim((string) ($request->input('city_name') ?: $request->input('city') ?: ''));
        $cityUuid = $request->input('city_uuid') ?: $request->input('cityUuid');

        if (!$cityName && $cityUuid) {
            $city = DB::table('cities')->where('uuid', $cityUuid)->first();
            $cityName = $city ? $city->name : '';
        } elseif ($cityName && !$cityUuid) {
            $city = DB::table('cities')->where('name', $cityName)->first();
            $cityUuid = $city ? $city->uuid : null;
        } else {
            $city = $cityUuid ? DB::table('cities')->where('uuid', $cityUuid)->first() : null;
        }

        if (!$cityName && !$city) {
            return response()->json([
                'status'  => false,
                'success' => false,
                'message' => 'City name or UUID is required.',
                'data'    => [],
            ], 422);
        }

        $resolvedCityName = $cityName ?: ($city ? $city->name : '');
        $resolvedCityUuid = $cityUuid ?: ($city ? $city->uuid : null);

        // Call getTownsByCity to get complete, dynamic, real towns (auto-saved to DB & cached)
        $subRequest = Request::create('/api/find-towns-by-city', 'POST', [
            'city_uuid' => $resolvedCityUuid,
            'city_name' => $resolvedCityName,
        ]);

        $response = $this->getTownsByCity($subRequest);
        $resData = $response->getData(true);
        $townList = $resData['data'] ?? [];

        // Extract area names
        $areas = [];
        foreach ($townList as $item) {
            $name = is_array($item) ? ($item['town_name'] ?? $item['name'] ?? '') : (string) $item;
            $name = trim($name);
            if ($name !== '') {
                $areas[] = $name;
            }
        }

        $areas = array_values(array_unique($areas));
        natcasesort($areas);
        $areas = array_values($areas);

        return response()->json([
            'status'    => true,
            'success'   => true,
            'city_name' => $resolvedCityName,
            'total'     => count($areas),
            'data'      => $areas,
        ], 200);
    }
}