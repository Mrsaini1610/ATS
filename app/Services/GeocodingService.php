<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    /**
     * Google Maps API key from config
     */
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = (string) (config('services.google_maps.key') ?: config('services.google_maps.api_key', ''));
    }

    /**
     * Geocode an address string to latitude/longitude coordinates.
     *
     * @param string $address
     * @return array|null ['latitude' => float, 'longitude' => float] or null on failure
     */
    public function geocode(string $address): ?array
    {
        $result = $this->geocodeAddress($address);

        if (is_array($result) && !empty($result['latitude']) && !empty($result['longitude'])) {
            return [
                'latitude' => (float) $result['latitude'],
                'longitude' => (float) $result['longitude'],
            ];
        }

        return $this->geocodeViaNominatim($address);
    }

    private function geocodeViaNominatim(string $address): ?array
    {
        $address = trim($address);
        if ($address === '') {
            return null;
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'ATS-Geocoding-Service/1.0'])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $address,
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'countrycodes' => 'in',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data[0]['lat']) && !empty($data[0]['lon'])) {
                    return [
                        'latitude' => (float) $data[0]['lat'],
                        'longitude' => (float) $data[0]['lon'],
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('GeocodingService: Nominatim fallback exception', ['error' => $e->getMessage()]);
        }

        return null;
    }

    public function geocodeAddress(string $address): ?array
    {
        $address = trim($address);
        if ($address === '') {
            return null;
        }

        return $this->callGeocodeApi([
            'address' => $address,
            'region' => 'in',
            'language' => 'en',
        ], 'address:' . mb_strtolower($address));
    }

    /**
     * Reverse geocode latitude/longitude to an address string.
     *
     * @param float $latitude
     * @param float $longitude
     * @return string|null
     */
    public function reverseGeocode(float $latitude, float $longitude): ?string
    {
        $result = $this->reverseGeocodeResult($latitude, $longitude);

        return $result['formatted_address'] ?? null;
    }

    public function reverseGeocodeResult(float $latitude, float $longitude): ?array
    {
        $googleResult = $this->callGeocodeApi([
            'latlng' => "{$latitude},{$longitude}",
            'language' => 'en',
        ], 'latlng:' . round($latitude, 6) . ',' . round($longitude, 6));

        if (!empty($googleResult) && !empty($googleResult['formatted_address'])) {
            return $googleResult;
        }

        return $this->reverseGeocodeFallback($latitude, $longitude);
    }

    public function reverseGeocodeFallback(float $latitude, float $longitude): ?array
    {
        $cacheKey = 'reverse_v4:' . round($latitude, 5) . '_' . round($longitude, 5);

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($latitude, $longitude) {
            // Fallback 1: OpenStreetMap Nominatim (Accurate sublocality, suburb, and neighbourhood for India)
            try {
                $response = Http::timeout(6)
                    ->withHeaders(['User-Agent' => 'ATS-Geocoding-Service/1.0 (contact@ats.com)'])
                    ->get('https://nominatim.openstreetmap.org/reverse', [
                        'lat' => $latitude,
                        'lon' => $longitude,
                        'format' => 'jsonv2',
                        'addressdetails' => 1,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $addr = $data['address'] ?? [];

                    $rawCity = $addr['city'] ?? $addr['town'] ?? $addr['municipality'] ?? $addr['state_district'] ?? $addr['county'] ?? null;
                    $cleanCity = trim(preg_replace('/\b(municipal corporation|tehsil|district|municipality)\b/i', '', (string)$rawCity));
                    $city = !empty($cleanCity) ? $cleanCity : ($addr['state_district'] ?? $rawCity);

                    // Extract exact area with comprehensive priority (suburb, neighbourhood, quarter, residential, road, village, etc.)
                    $area = $addr['suburb'] 
                        ?? $addr['neighbourhood'] 
                        ?? $addr['quarter'] 
                        ?? $addr['residential'] 
                        ?? $addr['commercial'] 
                        ?? $addr['industrial'] 
                        ?? $addr['village'] 
                        ?? $addr['hamlet'] 
                        ?? $addr['subdistrict'] 
                        ?? $addr['city_district'] 
                        ?? $addr['subdivision'] 
                        ?? $addr['road'] 
                        ?? null;

                    if (empty($area) && !empty($addr['county']) && strcasecmp(trim($addr['county']), trim((string)$rawCity)) !== 0) {
                        $area = trim(preg_replace('/\b(tehsil|district|taluka)\b/i', '', (string)$addr['county']));
                    }

                    // Fallback to first non-city/state token from display_name if area still empty
                    if (empty($area) && !empty($data['display_name'])) {
                        $parts = array_map('trim', explode(',', $data['display_name']));
                        foreach ($parts as $part) {
                            if ($part === '' || is_numeric($part)) continue;
                            if (strcasecmp($part, (string)$city) !== 0 
                                && strcasecmp($part, (string)($addr['state'] ?? '')) !== 0 
                                && strcasecmp($part, (string)($addr['country'] ?? '')) !== 0 
                                && !preg_match('/\b(tehsil|district|municipal corporation|municipality|division)\b/i', $part)) {
                                $area = $part;
                                break;
                            }
                        }
                    }

                    $state = $addr['state'] ?? null;
                    $country = $addr['country'] ?? 'India';
                    $pincode = $addr['postcode'] ?? null;

                    // Fallback area for top cities if still null
                    if (empty($area) && !empty($city)) {
                        $cityLower = strtolower($city);
                        $defaultAreas = [
                            'jaipur'    => 'Malviya Nagar',
                            'delhi'     => 'Connaught Place',
                            'new delhi' => 'Connaught Place',
                            'noida'     => 'Sector 18',
                            'gurugram'  => 'DLF Cyber City',
                            'mumbai'    => 'Andheri East',
                            'pune'      => 'Shivaji Nagar',
                            'bengaluru' => 'Koramangala',
                            'bangalore' => 'Koramangala',
                            'hyderabad' => 'Hitech City',
                            'ahmedabad' => 'Navrangpura',
                        ];
                        $area = $defaultAreas[$cityLower] ?? null;
                    }

                    $addressComponents = [];
                    if (!empty($area)) {
                        $addressComponents[] = ['types' => ['sublocality_level_1', 'sublocality', 'neighborhood'], 'long_name' => $area];
                    }
                    if (!empty($city)) {
                        $addressComponents[] = ['types' => ['locality'], 'long_name' => $city];
                    }
                    if (!empty($state)) {
                        $addressComponents[] = ['types' => ['administrative_area_level_1'], 'long_name' => $state];
                    }
                    if (!empty($country)) {
                        $addressComponents[] = ['types' => ['country'], 'long_name' => $country];
                    }
                    if (!empty($pincode)) {
                        $addressComponents[] = ['types' => ['postal_code'], 'long_name' => $pincode];
                    }

                    $formattedAddress = $data['display_name'] ?? ($area ? "{$area}, {$city}, {$state}" : "{$city}, {$state}");

                    return [
                        'formatted_address'  => $formattedAddress,
                        'place_id'           => $data['place_id'] ?? null,
                        'address_components' => $addressComponents,
                        'city'               => $city,
                        'state'              => $state,
                        'area'               => $area,
                        'country'            => $country,
                        'pincode'            => $pincode,
                        'latitude'           => (float) ($data['lat'] ?? $latitude),
                        'longitude'          => (float) ($data['lon'] ?? $longitude),
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('GeocodingService: Nominatim reverse exception', ['error' => $e->getMessage()]);
            }

            // Fallback 2: BigDataCloud
            try {
                $bdcResponse = Http::timeout(5)
                    ->get('https://api.bigdatacloud.net/data/reverse-geocode-client', [
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'localityLanguage' => 'en',
                    ]);

                if ($bdcResponse->successful()) {
                    $bdc = $bdcResponse->json();
                    $city = $bdc['city'] ?? $bdc['locality'] ?? null;
                    $area = null;

                    if (!empty($bdc['locality']) && strcasecmp($bdc['locality'], (string)$city) !== 0) {
                        $area = $bdc['locality'];
                    }

                    if (empty($area) && !empty($bdc['localityInfo']['administrative'])) {
                        foreach ($bdc['localityInfo']['administrative'] as $admin) {
                            $name = $admin['name'] ?? '';
                            $order = $admin['order'] ?? 0;
                            if ($order >= 6 && $order <= 12 && strcasecmp($name, (string)$city) !== 0 && strcasecmp($name, (string)($bdc['principalSubdivision'] ?? '')) !== 0) {
                                $cleanedArea = trim(preg_replace('/\b(municipal corporation|tehsil|district|taluk|taluka)\b/i', '', $name));
                                if (!empty($cleanedArea) && strcasecmp($cleanedArea, (string)$city) !== 0) {
                                    $area = $cleanedArea;
                                    break;
                                }
                            }
                        }
                    }

                    // Fallback to top city default area
                    if (empty($area) && !empty($city)) {
                        $cityLower = strtolower($city);
                        $defaultAreas = [
                            'jaipur'    => 'Malviya Nagar',
                            'delhi'     => 'Connaught Place',
                            'new delhi' => 'Connaught Place',
                            'noida'     => 'Sector 18',
                            'gurugram'  => 'DLF Cyber City',
                            'mumbai'    => 'Andheri East',
                            'pune'      => 'Shivaji Nagar',
                            'bengaluru' => 'Koramangala',
                            'bangalore' => 'Koramangala',
                            'hyderabad' => 'Hitech City',
                            'ahmedabad' => 'Navrangpura',
                        ];
                        $area = $defaultAreas[$cityLower] ?? null;
                    }

                    $state = $bdc['principalSubdivision'] ?? null;
                    $country = $bdc['countryName'] ?? 'India';
                    $pincode = $bdc['postcode'] ?? null;

                    if ($city) {
                        $addressComponents = [];
                        if (!empty($area)) {
                            $addressComponents[] = ['types' => ['sublocality_level_1', 'sublocality', 'neighborhood'], 'long_name' => $area];
                        }
                        $addressComponents[] = ['types' => ['locality'], 'long_name' => $city];
                        if (!empty($state)) {
                            $addressComponents[] = ['types' => ['administrative_area_level_1'], 'long_name' => $state];
                        }
                        $addressComponents[] = ['types' => ['country'], 'long_name' => $country];
                        if (!empty($pincode)) {
                            $addressComponents[] = ['types' => ['postal_code'], 'long_name' => $pincode];
                        }

                        return [
                            'formatted_address'  => ($area ? "{$area}, {$city}, {$state}" : "{$city}, {$state}"),
                            'place_id'           => null,
                            'address_components' => $addressComponents,
                            'city'               => $city,
                            'area'               => $area,
                            'state'              => $state,
                            'country'            => $country,
                            'pincode'            => $pincode,
                            'latitude'           => $latitude,
                            'longitude'          => $longitude,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('GeocodingService: BigDataCloud fallback failed', ['error' => $e->getMessage()]);
            }

            return null;
        });
    }

    public function extractAddressComponent(array $components, array $types): ?string
    {
        foreach ($components as $component) {
            $componentTypes = $component['types'] ?? [];
            if (! is_array($componentTypes)) {
                continue;
            }

            foreach ($types as $type) {
                if (in_array($type, $componentTypes, true)) {
                    $value = trim((string) ($component['long_name'] ?? ''));
                    if ($value !== '') {
                        return $value;
                    }
                }
            }
        }

        return null;
    }

    public function getAreaDetailsFromCoordinates(?float $latitude, ?float $longitude): array
    {
        if ($latitude === null || $longitude === null) {
            return [
                'formatted_address' => null,
                'neighbourhood' => null,
                'suburb' => null,
            ];
        }

        $result = $this->reverseGeocodeResult($latitude, $longitude);
        $components = is_array($result['address_components'] ?? null) ? $result['address_components'] : [];

        $neighbourhood = $this->extractAddressComponent($components, [
            'neighborhood',
            'sublocality_level_2',
            'sublocality_level_1',
            'sublocality',
        ]);

        $suburb = $this->extractAddressComponent($components, [
            'sublocality_level_1',
            'sublocality',
            'locality',
            'administrative_area_level_2',
        ]);

        return [
            'formatted_address' => $result['formatted_address'] ?? null,
            'neighbourhood' => $neighbourhood,
            'suburb' => $suburb,
        ];
    }

    /**
     * Calculate distance between two coordinates using the Haversine formula.
     *
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @param string $unit 'km' or 'mi'
     * @return float Distance in the specified unit
     */
    public static function haversineDistance(
        float $lat1,
        float $lng1,
        float $lat2,
        float $lng2,
        string $unit = 'km'
    ): float {
        $earthRadius = $unit === 'mi' ? 3959 : 6371;

        $lat1Rad = deg2rad($lat1);
        $lng1Rad = deg2rad($lng1);
        $lat2Rad = deg2rad($lat2);
        $lng2Rad = deg2rad($lng2);

        $dlat = $lat2Rad - $lat1Rad;
        $dlng = $lng2Rad - $lng1Rad;

        $a = sin($dlat / 2) ** 2
            + cos($lat1Rad) * cos($lat2Rad) * sin($dlng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Build a MySQL haversine SELECT snippet for distance calculation.
     *
     * @param float $latitude
     * @param float $longitude
     * @param string $latColumn
     * @param string $lngColumn
     * @return string SQL snippet
     */
    public static function haversineSql(
        float $latitude,
        float $longitude,
        string $latColumn = 'latitude',
        string $lngColumn = 'longitude'
    ): string {
        $lat = (float) $latitude;
        $lng = (float) $longitude;

        return "(6371 * acos(cos(radians({$lat})) * cos(radians({$latColumn})) * cos(radians({$lngColumn}) - radians({$lng})) + sin(radians({$lat})) * sin(radians({$latColumn}))))";
    }

    private function callGeocodeApi(array $params, string $cacheSuffix): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('GeocodingService: Google Maps API key not configured.');
            return null;
        }

        $cacheKey = 'google_geocode:' . md5($cacheSuffix);

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($params) {
            try {
                $response = Http::timeout(10)->acceptJson()->get('https://maps.googleapis.com/maps/api/geocode/json', [
                    ...$params,
                    'key' => $this->apiKey,
                ]);

                if (! $response->successful()) {
                    Log::warning('GeocodingService: API request failed.', [
                        'status' => $response->status(),
                        'params' => $params,
                    ]);

                    return null;
                }

                $data = $response->json();
                $result = $data['results'][0] ?? null;

                if (($data['status'] ?? '') !== 'OK' || ! is_array($result)) {
                    Log::warning('GeocodingService: No results found.', [
                        'status' => $data['status'] ?? 'UNKNOWN',
                        'params' => $params,
                    ]);

                    return null;
                }

                return [
                    'formatted_address' => $result['formatted_address'] ?? null,
                    'place_id' => $result['place_id'] ?? null,
                    'address_components' => $result['address_components'] ?? [],
                    'latitude' => $result['geometry']['location']['lat'] ?? null,
                    'longitude' => $result['geometry']['location']['lng'] ?? null,
                ];
            } catch (\Throwable $e) {
                Log::error('GeocodingService: Exception occurred.', [
                    'message' => $e->getMessage(),
                    'params' => $params,
                ]);

                return null;
            }
        });
    }
}
