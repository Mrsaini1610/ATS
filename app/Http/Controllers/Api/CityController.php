<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;
use App\Models\State;
use App\Models\City;

class CityController extends Controller
{

// public function fetchAndSyncStates()
//     {
//         try {
//             // 1. Call API
//             $response = Http::timeout(30)->get('https://uat.apiclub.in/api/v1/states/IN');

//             if (!$response->successful()) {
//                 return response()->json([
//                     'status' => false,
//                     'message' => 'Failed to retrieve data from API.',
//                     'error' => $response->body()
//                 ], $response->status());
//             }

//             $apiData = $response->json();

//             // Adjust payload key depending on API response structure (e.g., $apiData['data'] or $apiData['response'])
//             $statesData = $apiData['response'] ?? $apiData['data'] ?? $apiData;

//             if (empty($statesData) || !is_array($statesData)) {
//                 return response()->json([
//                     'status' => false,
//                     'message' => 'No state data found in API response.'
//                 ], 404);
//             }

//             $insertData = [];
//             $now = now();

//             foreach ($statesData as $item) {
//     $insertData[] = [
//         'uuid'         => (string) Str::uuid(),
//         'name'         => $item['name'] ?? $item['state_name'] ?? null,
//         'country_code' => $item['country_code'] ?? 'IN',
//         'country_name' => $item['country_name'] ?? 'India',
//         'state_code'   => $item['state_code'] ?? $item['iso2'] ?? null,
//         'type'         => $item['type'] ?? null,
//         'latitude'     => $item['latitude'] ?? $item['lat'] ?? null,
//         'longitude'    => $item['longitude'] ?? $item['lng'] ?? null,
//         'created_at'   => $now,
//     ];
// }

// DB::transaction(function () use ($insertData) {
//     State::upsert(
//         $insertData,
//         ['state_code'], 
//         ['name', 'country_code', 'country_name', 'type', 'latitude', 'longitude'] // Removed updated_at
//     );
// });

//             return response()->json([
//                 'status'  => true,
//                 'message' => 'States inserted/updated successfully.',
//                 'count'   => count($insertData)
//             ], 200);

//         } catch (\Exception $e) {
//             return response()->json([
//                 'status'  => false,
//                 'message' => 'An error occurred while saving states.',
//                 'error'   => $e->getMessage()
//             ], 500);
//         }
//     }

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
                // Dynamic API endpoint
                $apiUrl = "https://uat.apiclub.in/api/v1/cities/{$state->state_code}";

                // timeout(0) unlimited timeout set karta hai Guzzle/Laravel Client par
                $response = Http::timeout(0)->get($apiUrl);

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
                        // 'updated_at' => $now,
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
}