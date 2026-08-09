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

        if (! is_array($result)) {
            return null;
        }

        return [
            'latitude' => isset($result['latitude']) ? (float) $result['latitude'] : null,
            'longitude' => isset($result['longitude']) ? (float) $result['longitude'] : null,
        ];
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
        return $this->callGeocodeApi([
            'latlng' => "{$latitude},{$longitude}",
            'language' => 'en',
        ], 'latlng:' . round($latitude, 6) . ',' . round($longitude, 6));
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
