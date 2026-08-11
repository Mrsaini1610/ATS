<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'aadhar' => [
        'key' => env('SENDBOX_API_KEY'),
        'secret' => env('SENDBOX_API_SECRET'),
        'version' => env('SENDBOX_API_VERSION'),
        'base_path' => env('SENDBOX_BASE_PATH'),
    ],

    'bunny_cdn' => [
        'access_key' => env('BUNNY_ACCESS_KEY'),
        'storage_zone_name' => env('BUNNY_STORAGE_ZONE_NAME'),
        'host_name' => env('REGION') ? env('REGION') . '.' . env('BASE_HOSTNAME') : env('BASE_HOSTNAME'),
        'base_host_name' => env('BASE_HOSTNAME'),
        'region' => env('REGION'),
    ],

    'google_maps' => [
        'key' => env('GOOGLE_MAPS_API_KEY'),
    ],

];
