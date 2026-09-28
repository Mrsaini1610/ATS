<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use App\Services\GeocodingService;
use Exception;
use App\Models\State;
use App\Models\City;

class LocationController extends Controller
{
    /**
     * Curated popular localities for major Indian cities
     */
    protected array $knownLocalities = [
        'jaipur' => [
            'Niwaru', 'Niwaru Road', 'Jhotwara', 'Kalwar Road', 'Khatipura', 'Harmada', 'Murlipura',
            'Vidhyadhar Nagar', 'Shastri Nagar', 'Ambabari', 'Bani Park', 'C-Scheme', 'Civil Lines',
            'Bais Godam', 'Hasanpura', 'Sodala', 'Shyam Nagar', 'Nirman Nagar', 'Vaishali Nagar',
            'Sirsi Road', 'Chitrakoot', 'Ajmer Road', 'Bhankrota', 'Mansarovar', 'Gopalpura',
            'Gopalpura Bypass', 'Durgapura', 'Mahaveer Nagar', 'Tonk Road', 'Sitapura', 'Pratap Nagar',
            'Sanganer', 'Malviya Nagar', 'Jagatpura', 'Raja Park', 'Tilak Nagar', 'Adarsh Nagar',
            'Jawahar Nagar', 'Sethi Colony', 'Transport Nagar', 'Ghat Gate', 'Johari Bazaar',
            'Chandpole', 'MI Road', 'Ajmeri Gate', 'Tripolia', 'Amer', 'Kukas', 'VKI Area',
            'Bagru', 'Bassi', 'Chomu', 'Mahindra SEZ', 'Gandhi Nagar', 'Mahesh Nagar',
            'Barkat Nagar', 'Lal Kothi', 'Bapu Nagar', 'Sindhi Camp', 'Station Road'
        ],
        'delhi' => [
            'Connaught Place', 'South Extension', 'Saket', 'Hauz Khas', 'Rohini',
            'Dwarka', 'Laxmi Nagar', 'Janakpuri', 'Karol Bagh', 'Nehru Place',
            'Okhla', 'Pitampura', 'Vasant Kunj', 'Mayur Vihar', 'Chandni Chowk'
        ],
        'new delhi' => [
            'Connaught Place', 'South Extension', 'Saket', 'Hauz Khas', 'Rohini',
            'Dwarka', 'Laxmi Nagar', 'Janakpuri', 'Karol Bagh', 'Nehru Place',
            'Okhla', 'Pitampura', 'Vasant Kunj', 'Mayur Vihar', 'Chandni Chowk'
        ],
        'noida' => [
            'Sector 18', 'Sector 62', 'Sector 15', 'Sector 16', 'Sector 50',
            'Sector 128', 'Sector 137', 'Greater Noida West', 'Expressway', 'Pari Chowk'
        ],
        'gurugram' => [
            'DLF Cyber City', 'Cyber Hub', 'Golf Course Road', 'Sohna Road',
            'Sector 29', 'Sector 14', 'Udyog Vihar', 'MG Road', 'Palam Vihar', 'Sector 56'
        ],
        'gurgaon' => [
            'DLF Cyber City', 'Cyber Hub', 'Golf Course Road', 'Sohna Road',
            'Sector 29', 'Sector 14', 'Udyog Vihar', 'MG Road', 'Palam Vihar', 'Sector 56'
        ],
        'mumbai' => [
            'Andheri East', 'Andheri West', 'Bandra West', 'Bandra East', 'Powai',
            'Thane West', 'Navi Mumbai', 'Dadar', 'Borivali West', 'Goregaon East',
            'Malad West', 'BKC', 'Kurla', 'Lower Parel', 'Juhu', 'Kandivali', 'Worli'
        ],
        'bengaluru' => [
            'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'BTM Layout',
            'Electronic City', 'Jayanagar', 'Marathahalli', 'Hebbal', 'Yelahanka',
            'Bellandur', 'MG Road', 'Banashankari', 'Rajajinagar', 'JP Nagar'
        ],
        'bangalore' => [
            'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'BTM Layout',
            'Electronic City', 'Jayanagar', 'Marathahalli', 'Hebbal', 'Yelahanka',
            'Bellandur', 'MG Road', 'Banashankari', 'Rajajinagar', 'JP Nagar'
        ],
        'pune' => [
            'Hinjawadi', 'Viman Nagar', 'Kothrud', 'Baner', 'Wakad', 'Hadapsar',
            'Shivaji Nagar', 'Aundh', 'Magarpatta', 'Pimpri', 'Chinchwad', 'Kalyani Nagar'
        ],
        'hyderabad' => [
            'Hitech City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Kukatpally',
            'Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Begumpet', 'Ameerpet'
        ],
        'ahmedabad' => [
            'SG Highway', 'Prahlad Nagar', 'Navrangpura', 'Satellite', 'Bopal',
            'Maninagar', 'Vastrapur', 'Bodakdev', 'Chandkheda', 'Ghatlodia'
        ],
        'kolkata' => [
            'Salt Lake', 'New Town', 'Park Street', 'Howrah', 'Ballygunge',
            'Alipore', 'Dum Dum', 'Garia', 'Jadavpur', 'Behala'
        ],
        'chennai' => [
            'T. Nagar', 'Adyar', 'Velachery', 'Anna Nagar', 'OMR', 'Guindy',
            'Porur', 'Tambaram', 'Nungambakkam', 'Mylapore'
        ],
        'lucknow' => [
            'Gomti Nagar', 'Hazratganj', 'Alambagh', 'Indira Nagar', 'Mahanagar',
            'Aliganj', 'Jankipuram', 'Ashiyana', 'Vikas Nagar', 'Chowk'
        ],
        'chandigarh' => [
            'Sector 17', 'Sector 35', 'Sector 22', 'Sector 43', 'IT Park',
            'Manimajra', 'Mohali Phase 7', 'Mohali Phase 5', 'Panchkula Sector 5'
        ],
        'indore' => [
            'Vijay Nagar', 'Palasia', 'Rajwada', 'Bhawarkua', 'AB Road', 'Rau'
        ],
        'bhopal' => [
            'MP Nagar', 'Arera Colony', 'Kolar Road', 'Hoshangabad Road', 'TT Nagar'
        ],
    ];

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

    public function getAreasByCityName(Request $request)
    {
        $cityName = trim((string) $request->input('city_name', 'Jaipur'));
        $cleanCityKey = strtolower(trim(preg_replace('/\b(city|district|corporation)\b/i', '', $cityName)));

        foreach ($this->knownLocalities as $key => $areas) {
            if ($cleanCityKey === $key || str_contains($cleanCityKey, $key) || str_contains($key, $cleanCityKey)) {
                return response()->json([
                    'status' => true,
                    'city'   => $cityName,
                    'total'  => count($areas),
                    'data'   => $areas,
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'city'   => $cityName,
            'total'  => 0,
            'data'   => [],
        ]);
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
            $city = DB::table('cities')
                ->leftJoin('states', function ($join) {
                    $join->on('cities.state_uuid', '=', DB::raw('states.uuid COLLATE utf8mb4_unicode_ci'));
                })
                ->where('cities.uuid', $cityUuid) 
                ->select('cities.name as city_name', 'cities.latitude', 'cities.longitude', 'states.state_code', 'states.name as state_name')
                ->first();

            if (!$city) {
                return response()->json([
                    'status'  => false,
                    'message' => 'City record not found for the given UUID.'
                ], 404);
            }

            $cityName = trim($city->city_name);
            $cleanCityKey = strtolower(trim(preg_replace('/\b(city|district|corporation)\b/i', '', $cityName)));

            // 1. Instant check from curated known localities
            foreach ($this->knownLocalities as $key => $areas) {
                if ($cleanCityKey === $key || str_contains($cleanCityKey, $key) || str_contains($key, $cleanCityKey)) {
                    $parsedList = array_map(function ($areaName) use ($city) {
                        return [
                            'town_name'  => $areaName,
                            'latitude'   => $city->latitude ? (float) $city->latitude : null,
                            'longitude'  => $city->longitude ? (float) $city->longitude : null,
                            'place_type' => 'suburb'
                        ];
                    }, $areas);

                    return response()->json([
                        'status'    => true,
                        'city_name' => $cityName,
                        'total'     => count($parsedList),
                        'data'      => $parsedList
                    ], 200);
                }
            }

            $cacheKey = "towns_list_v2_" . md5($cityUuid . '_' . $cityName);

            $townsList = Cache::remember($cacheKey, 60 * 24 * 30, function () use ($city, $cityName) {
                // 2. Check DB towns table
                $dbTowns = DB::table('towns')
                    ->where('city_uuid', $city->uuid ?? '')
                    ->select('name as town_name', 'latitude', 'longitude')
                    ->get();

                if ($dbTowns->isNotEmpty()) {
                    return $dbTowns->toArray();
                }

                // 3. Fallback to OpenStreetMap Nominatim search for areas
                try {
                    $osmRes = Http::timeout(4)
                        ->withHeaders(['User-Agent' => 'ATS-Geocoding-Service/1.0'])
                        ->get('https://nominatim.openstreetmap.org/search', [
                            'q'            => "areas in {$cityName}, India",
                            'format'       => 'jsonv2',
                            'limit'        => 30,
                            'countrycodes' => 'in',
                        ]);

                    if ($osmRes->successful()) {
                        $items = $osmRes->json();
                        if (is_array($items) && !empty($items)) {
                            $parsed = [];
                            foreach ($items as $item) {
                                $name = $item['name'] ?? null;
                                if ($name && strcasecmp($name, $cityName) !== 0) {
                                    $parsed[] = [
                                        'town_name'  => $name,
                                        'latitude'   => (float) ($item['lat'] ?? 0),
                                        'longitude'  => (float) ($item['lon'] ?? 0),
                                        'place_type' => $item['type'] ?? 'suburb',
                                    ];
                                }
                            }
                            if (!empty($parsed)) {
                                return $parsed;
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    // Ignore
                }

                // 4. Default popular zones fallback so list is NEVER empty
                $defaultZones = [
                    'City Center', 'Main Market', 'Civil Lines', 'Industrial Area',
                    'Station Road', 'North Extension', 'South Extension', 'Model Town',
                ];

                return array_map(function ($zone) use ($city) {
                    return [
                        'town_name'  => $zone,
                        'latitude'   => $city->latitude ? (float) $city->latitude : null,
                        'longitude'  => $city->longitude ? (float) $city->longitude : null,
                        'place_type' => 'suburb'
                    ];
                }, $defaultZones);
            });

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
        $lat = $request->input('latitude');
        $lng = $request->input('longitude');
        $ipCity = null;
        $ipState = null;

        // If coordinates not provided or invalid, fallback to IP Geolocation
        if (empty($lat) || empty($lng) || !is_numeric($lat) || !is_numeric($lng)) {
            $ip = (string) $request->ip();
            $isLocal = ($ip === '' || $ip === '127.0.0.1' || $ip === '::1' 
                || str_starts_with($ip, '192.168.') 
                || str_starts_with($ip, '10.') 
                || str_starts_with($ip, '172.'));
            $ipTarget = $isLocal ? '' : $ip;
            
            try {
                $ipRes = Http::timeout(4)->get("http://ip-api.com/json/{$ipTarget}");
                if ($ipRes->successful()) {
                    $ipData = $ipRes->json();
                    if (($ipData['status'] ?? '') === 'success') {
                        $lat = $ipData['lat'] ?? 26.9124;
                        $lng = $ipData['lon'] ?? 75.7873;
                        $ipCity = $ipData['city'] ?? null;
                        $ipState = $ipData['regionName'] ?? null;
                    }
                }
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        $lat = (float) ($lat ?? 26.9124);
        $lng = (float) ($lng ?? 75.7873);
        $user = $request->user() ?: \Illuminate\Support\Facades\Auth::guard('web')->user();

        $geoResult = $geocodingService->reverseGeocodeResult($lat, $lng);
        $parsedLocation = $this->parseAddressComponents($geoResult ?? []);

        $city = $parsedLocation['city'] ?? $geoResult['city'] ?? $ipCity ?? 'Jaipur';
        $state = $parsedLocation['state'] ?? $geoResult['state'] ?? $ipState ?? 'Rajasthan';
        $country = $parsedLocation['country'] ?? $geoResult['country'] ?? 'India';
        $pincode = $parsedLocation['pincode'] ?? $geoResult['pincode'] ?? null;
        $area = $parsedLocation['area'] ?? $geoResult['area'] ?? null;

        // If area is still null, look up known default locality for the city
        if (empty($area) && !empty($city)) {
            $cleanCityKey = strtolower(trim(preg_replace('/\b(city|district)\b/i', '', $city)));
            foreach ($this->knownLocalities as $key => $localities) {
                if ($cleanCityKey === $key || str_contains($cleanCityKey, $key) || str_contains($key, $cleanCityKey)) {
                    $area = $localities[0] ?? null;
                    break;
                }
            }
        }

        $formattedAddress = $geoResult['formatted_address'] ?? ($area ? "{$area}, {$city}, {$state}" : "{$city}, {$state}, {$country}");

        $locationDetails = [
            'latitude'          => round($lat, 6),
            'longitude'         => round($lng, 6),
            'formatted_address' => $formattedAddress,
            'area'              => $area,
            'city'              => $city,
            'state'             => $state,
            'country'           => $country,
            'pincode'           => $pincode,
        ];

        if ($user) {
            $user->forceFill([
                'latitude'      => $locationDetails['latitude'],
                'longitude'     => $locationDetails['longitude'],
                'web_latitude'  => $locationDetails['latitude'],
                'web_longitude' => $locationDetails['longitude'],
                'city'          => $city ?: $user->city,
                'area'          => $area ?: $user->area,
                'state'         => $state ?: $user->state,
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