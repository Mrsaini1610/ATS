<?php

namespace App;

use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Helpers
{
    public static function formateDate($date)
    {
        return Carbon::parse($date)->format('d M Y \- g:i A');
    }

    public static function formateDate2($date)
    {
        return Carbon::parse($date)->format('d M - Y');
    }

    public static function shortDate($date)
    {
        return Carbon::parse($date)->format('j M');
    }

    public static function getFileExtension($fileName)
    {
        return !empty($fileName) ? pathinfo($fileName, PATHINFO_EXTENSION) : null;
    }

    /**
     * Short UUID
     * @return mixed
     */
    public static function shortUuid()
    {
        $shortUuid = Str::uuid()->toString();
        $shortUuid = substr($shortUuid, 0, 8);
        return $shortUuid;
    }


    /**
     * Short String
     * @param string $string
     * @param integer $charecters
     * @return mixed
     */
    function shortString($string, $charecters)
    {
        return substr($string, 0, $charecters);
    }

    /**
     * Convert to number format
     *
     * @param mixed $num
     * @param int $place
     * @return float|string
     */
    public static function numFormat($num, $place = 2)
    {
        return number_format($num, $place, '.');
    }

    /**
     * Format number as Rupee currency
     *
     * @param mixed $num
     * @param int $place
     * @return string
     */
    public static function toRupeeCurrency($num, $place = 2)
    {
        if (is_int($num) || is_numeric($num)) {
            return " ₹ " . self::numFormat($num, $place);
        } else {
            return 'NA';
        }
    }

    /**
     * Clean and format name to Camel Case
     *
     * @param string $name
     * @return string
     */
    public static function cleanName(string $name): string
    {
        return ucwords(strtolower(preg_replace('/\s+/', ' ', trim($name))));
    }

    /**
     * Generate a secure random password
     *
     * @param int $length
     * @param bool $includeUppercase
     * @param bool $includeNumbers
     * @param bool $includeSpecialChars
     * @return string
     */
    public static function passwordGenerate(
        int $length = 16,
        bool $includeUppercase = true,
        bool $includeNumbers = true,
        bool $includeSpecialChars = true
    ): string {
        $characters = 'abcdefghijklmnopqrstuvwxyz';
        if ($includeUppercase) $characters .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if ($includeNumbers) $characters .= '0123456789';
        if ($includeSpecialChars) $characters .= '!@#%&()_+=-~|;\':",/?';

        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, strlen($characters) - 1)];
        }

        return $password;
    }
}

if (!function_exists('hasPermissionLike')) {
    /**
     * Check if user has any permission starting with the given prefix
     *
     * @param string $prefix
     * @return bool
     */
    function hasPermissionLike(string $prefix): bool
    {
        $user = auth()->user();
        if (!$user) return false;

        $permissions = $user->getAllPermissions()->pluck('name');
        return $permissions->contains(fn($permission) => Str::startsWith($permission, $prefix));
    }
}

if (!function_exists('isServiceActive')) {
    /**
     * Check if a named service is active via system settings
     *
     * @param string $name
     * @return array
     */
    function isServiceActive(string $name): array
    {
        $setting = SystemSetting::whereName($name)->first();

        if ($setting && $setting->value == 1) {
            return [
                'status' => true,
                'message' => $setting->extra['message'] ?? 'Service active.'
            ];
        } elseif ($setting && $setting->value == 0) {
            return [
                'status' => false,
                'message' => $setting->extra['message'] ?? 'Service inactive, please contact to administrator.'
            ];
        } else {
            return [
                'status' => false,
                'message' => "Service not configured, contact administrator."
            ];
        }
    }
}


if (!function_exists('createMessagePayload')) {
    /**
     * Build Interakt template message payload
     *
     * @param string       $phoneNumber
     * @param string       $templateName
     * @param string       $languageCode
     * @param array|string $headerParameters
     * @param array|string $bodyParameters
     * @param array|string $mediaParameters
     * @param array        $buttonParameters
     * @param string       $countryCode
     * @return array
     */
    function createMessagePayload(
        string $phoneNumber,
        string $templateName,
        string $languageCode = 'en',
        $headerParameters = null,
        $bodyParameters = null,
        $buttonParameters = null,
        string $countryCode = '+91'
    ) {
        $template = [
            "name"         => $templateName,
            "languageCode" => $languageCode,
        ];

        // Header
        if (!empty($headerParameters)) {
            $template['headerValues'] = is_array($headerParameters) ? $headerParameters : [$headerParameters];
        }

        // Body
        if (!empty($bodyParameters)) {
            $template['bodyValues'] = is_array($bodyParameters) ? $bodyParameters : [$bodyParameters];
        }

        // Button (must be object to preserve keys as JSON object)
        if (!empty($buttonParameters)) {
            $template['buttonValues'] = (object) $buttonParameters;
        }

        return [
            "countryCode" => $countryCode,
            "phoneNumber" => $phoneNumber,
            "type"        => "Template",
            "template"    => $template,
        ];
    }
}

