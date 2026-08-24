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