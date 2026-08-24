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

        // Optional: Agar query parameter me city_uuid bhejein to sirf ek city sync hogi, warna all cities
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

        foreach ($cities as $city) {
            $cityName = trim($city->name);
            $cityNameEscaped = addslashes($cityName);

            // Dynamic Overpass Query for each city
            $overpassQuery = '[out:json][timeout:120];area["name"="' . $cityNameEscaped . '"]->.searchArea;(node["place"~"city|town|suburb|neighbourhood|locality|quarter|subdistrict|village"](area.searchArea);way["place"~"city|town|suburb|neighbourhood|locality|quarter|subdistrict|village"](area.searchArea););out center tags;';

            try {
                $response = Http::withoutVerifying()
                    ->withHeaders([
                        'User-Agent' => 'LaravelApp/1.0 (LocationSyncBot)',
                        'Accept'     => 'application/json',
                    ])
                    ->asForm()
                    ->timeout(120)
                    ->post('https://overpass-api.de/api/interpreter', [
                        'data' => $overpassQuery
                    ]);

                if (!$response->successful()) {
                    $citySummary[] = [
                        'city'   => $cityName,
                        'status' => 'failed',
                        'error'  => 'HTTP Status: ' . $response->status()
                    ];
                    continue;
                }

                $elements = $response->json('elements') ?? [];
                $recordsToInsert = [];
                $now = now();

                foreach ($elements as $element) {
                    $townName = $element['tags']['name'] ?? null;
                    if (!$townName) {
                        continue;
                    }

                    $safeTownName = Str::limit($townName, 145, '');
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

                // Batch insert
                if (!empty($recordsToInsert)) {
                    $chunks = array_chunk($recordsToInsert, 100);
                    foreach ($chunks as $chunk) {
                        DB::table('towns')->insert($chunk);
                    }
                }

                $count = count($recordsToInsert);
                $totalInsertedAllCities += $count;

                $citySummary[] = [
                    'city'     => $cityName,
                    'status'   => 'success',
                    'inserted' => $count
                ];

                // Overpass API Rate Limiting protection (1 second wait)
                sleep(1);

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
            'message'        => 'Cities sync process complete!',
            'total_inserted' => $totalInsertedAllCities,
            'details'        => $citySummary
        ], 200);
    }
}
