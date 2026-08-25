<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TownController extends Controller
{
    public function syncTownsFromOverpass(Request $request)
    {
        set_time_limit(0);
        ini_set('memory_limit', '1024M');

        // 1. Fetch Cities
        $cityQuery = DB::table('cities');
        if ($request->filled('city_uuid')) {
            $cityQuery->where('uuid', $request->city_uuid);
        }

        $cities = $cityQuery->get();

        if ($cities->isEmpty()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Database me koi city nahi mili.'
            ], 404);
        }

        $totalInsertedAllCities = 0;
        $citySummary = [];

        // Backup Overpass Endpoints to prevent 429 / 504 errors
        $overpassEndpoints = [
            'https://overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
        ];

        foreach ($cities as $city) {
            $cityName = trim($city->name);
            
            // Clean city name for Overpass query
            $cleanCityName = str_replace(['"', '\\'], ['\"', '\\\\'], $cityName);

            // Overpass QL Query
            $overpassQuery = '[out:json][timeout:180];' .
                'area["name"="' . $cleanCityName . '"]->.searchArea;' .
                '(' .
                    'node["place"~"city|town|suburb|neighbourhood|locality|quarter|subdistrict|village"](area.searchArea);' .
                    'way["place"~"city|town|suburb|neighbourhood|locality|quarter|subdistrict|village"](area.searchArea);' .
                ');out center tags;';

            try {
                $response = null;

                // Alternate Endpoint Fallback Loop
                foreach ($overpassEndpoints as $endpoint) {
                    $res = Http::withoutVerifying()
                        ->withHeaders([
                            'User-Agent' => 'LaravelApp/1.0 (LocationSyncBot)',
                            'Accept'     => 'application/json',
                        ])
                        ->asForm()
                        ->timeout(180)
                        ->post($endpoint, ['data' => $overpassQuery]);

                    if ($res->successful()) {
                        $response = $res;
                        break;
                    }

                    // Request fail hone par thoda pause le kar next mirror server try karein
                    sleep(2);
                }

                if (!$response || !$response->successful()) {
                    $citySummary[] = [
                        'city'   => $cityName,
                        'status' => 'failed',
                        'error'  => 'API servers timed out or limit reached (Status: ' . ($response ? $response->status() : 'No response') . ')'
                    ];
                    continue;
                }

                $elements = $response->json('elements') ?? [];
                
                if (empty($elements)) {
                    $citySummary[] = [
                        'city'     => $cityName,
                        'status'   => 'success',
                        'inserted' => 0,
                        'message'  => 'No nodes/ways found for this area.'
                    ];
                    continue;
                }

                $recordsToInsert = [];
                $now = now();

                foreach ($elements as $element) {
                    $townName = $element['tags']['name'] ?? null;
                    if (!$townName) {
                        continue;
                    }

                    $safeTownName = Str::limit(trim($townName), 145, '');
                    $lat = $element['lat'] ?? ($element['center']['lat'] ?? null);
                    $lon = $element['lon'] ?? ($element['center']['lon'] ?? null);

                    $recordsToInsert[] = [
                        'uuid'       => (string) Str::uuid(),
                        'name'       => $safeTownName,
                        'city_uuid'  => $city->uuid,
                        'latitude'   => $lat ? round($lat, 8) : null,
                        'longitude'  => $lon ? round($lon, 8) : null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                // 2. Prevent Duplicate Insertion with Upsert / Unique Handling
                $insertedCount = 0;
                if (!empty($recordsToInsert)) {
                    $chunks = array_chunk($recordsToInsert, 200);
                    foreach ($chunks as $chunk) {
                        // DB Upsert (requires unique index on ['name', 'city_uuid'] in DB migration)
                        DB::table('towns')->upsert(
                            $chunk,
                            ['name', 'city_uuid'], 
                            ['latitude', 'longitude', 'updated_at']
                        );
                    }
                    $insertedCount = count($recordsToInsert);
                }

                $totalInsertedAllCities += $insertedCount;

                $citySummary[] = [
                    'city'     => $cityName,
                    'status'   => 'success',
                    'inserted' => $insertedCount
                ];

                // Rate limit safe pause
                sleep(2);

            } catch (\Exception $e) {
                $citySummary[] = [
                    'city'   => $cityName,
                    'status' => 'failed',
                    'error'  => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'status'         => 'success',
            'message'        => 'Towns sync process completed successfully!',
            'total_inserted' => $totalInsertedAllCities,
            'details'        => $citySummary
        ], 200);
    }
}