<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use App\Services\GeocodingService;
use Exception;
use App\Models\State;
use App\Models\City;

class LocationController extends Controller
{
    public function getState(Request $request)
    {
        $states = DB::table('states')->select('name', 'uuid')->orderBy('name', 'asc')->get();

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
            // Fix 1: Hardcoded UUID ki jagah dynamic input variable pass kiya
            $city = DB::table('cities')
                ->leftJoin('states', function ($join) {
                    $join->on('cities.state_uuid', '=', DB::raw('states.uuid COLLATE utf8mb4_unicode_ci'));
                })
                ->where('cities.uuid', $cityUuid) 
                ->select('cities.name as city_name', 'states.state_code', 'states.name as state_name')
                ->first();

            if (!$city) {
                return response()->json([
                    'status'  => false,
                    'message' => 'City record not found for the given UUID.'
                ], 404);
            }

            $cityName = trim($city->city_name);
            $cacheKey = "towns_list_" . md5($cityUuid . '_' . $cityName);

            // Fix 2: Cache Check - Agar data pehle se fetched hai to instant return karo (30 Days Cache)
            $townsList = Cache::remember($cacheKey, 60 * 24 * 30, function () use ($city, $cityName) {

                $stateIso = 'IN-RJ';
                if (!empty($city->state_code)) {
                    $code = strtoupper(trim($city->state_code));
                    $stateIso = str_starts_with($code, 'IN-') ? $code : "IN-{$code}";
                }

                $overpassQuery = <<<OVERPASS
[out:json][timeout:60];
area["ISO3166-2"="{$stateIso}"]["admin_level"="4"]->.state;
area["name"~"^{$cityName}( District)?$"]["boundary"="administrative"](area.state)->.district;
(
node["place"~"^(city|town|suburb|quarter|neighbourhood|municipality|census_town|village)$"](area.district);
way["place"~"^(city|town|suburb|quarter|neighbourhood|municipality|census_town|village)$"](area.district);
);
out center tags;
OVERPASS;

                $endpoints = [
                    'https://overpass-api.de/api/interpreter',
                    'https://overpass.kumi.systems/api/interpreter',
                    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
                ];

                $apiData = null;

                foreach ($endpoints as $url) {
                    try {
                        $res = Http::withoutVerifying()
                            ->timeout(60)
                            ->withHeaders([
                                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Accept'     => '*/*'
                            ])
                            ->asForm()
                            ->post($url, ['data' => $overpassQuery]);

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
                    return null;
                }

                $elements = $apiData['elements'] ?? [];
                $parsedList = [];
                $uniqueCheck = [];

                foreach ($elements as $item) {
                    $name = $item['tags']['name'] ?? $item['tags']['name:en'] ?? null;
                    if (!$name) continue;

                    $lat = $item['lat'] ?? ($item['center']['lat'] ?? null);
                    $lon = $item['lon'] ?? ($item['center']['lon'] ?? null);

                    if ($lat === null || $lon === null) continue;

                    $key = strtolower(trim($name)) . '_' . round((float)$lat, 3) . '_' . round((float)$lon, 3);
                    if (isset($uniqueCheck[$key])) continue;
                    $uniqueCheck[$key] = true;

                    $parsedList[] = [
                        'town_name'  => $name,
                        'latitude'   => (float) $lat,
                        'longitude'  => (float) $lon,
                        'place_type' => $item['tags']['place'] ?? 'town'
                    ];
                }

                return $parsedList;
            });

            if ($townsList === null) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Overpass servers timed out or busy. Please try again.',
                ], 504);
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

    public function updateLocation(Request $request, GeocodingService $geocodingService)
    {
        $validated = $request->validate([
            'latitude'  => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $lat = (float) $validated['latitude'];
        $lng = (float) $validated['longitude'];
        $user = $request->user();

        $geoResult = $geocodingService->reverseGeocodeResult($lat, $lng);
        $parsedLocation = $this->parseAddressComponents($geoResult ?? []);

        $locationDetails = [
            'latitude'          => round($lat, 6),
            'longitude'         => round($lng, 6),
            'formatted_address' => $geoResult['formatted_address'] ?? $parsedLocation['formatted_address'] ?? null,
            'area'              => $parsedLocation['area'] ?? null,
            'city'              => $parsedLocation['city'] ?? null,
            'state'             => $parsedLocation['state'] ?? null,
            'country'           => $parsedLocation['country'] ?? null,
            'pincode'           => $parsedLocation['pincode'] ?? null,
        ];

        if ($user) {
            $user->forceFill([
                'latitude'  => $locationDetails['latitude'],
                'longitude' => $locationDetails['longitude'],
            ])->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully.',
            'data'    => $locationDetails,
        ]);
    }

    private function parseAddressComponents(?array $geoResult): array
    {
        $components = $geoResult['address_components'] ?? [];
        $res = [
            'area' => null, 'city' => null, 'state' => null, 
            'country' => null, 'pincode' => null, 
            'formatted_address' => $geoResult['formatted_address'] ?? null
        ];

        foreach ($components as $comp) {
            $types = $comp['types'] ?? [];
            if (in_array('sublocality_level_1', $types) || in_array('neighborhood', $types)) {
                $res['area'] = $comp['long_name'];
            }
            if (in_array('locality', $types)) {
                $res['city'] = $comp['long_name'];
            }
            if (in_array('administrative_area_level_1', $types)) {
                $res['state'] = $comp['long_name'];
            }
            if (in_array('country', $types)) {
                $res['country'] = $comp['long_name'];
            }
            if (in_array('postal_code', $types)) {
                $res['pincode'] = $comp['long_name'];
            }
        }

        return $res;
    }
}