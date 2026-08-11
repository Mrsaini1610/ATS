<?php

return [
    'url' => env('APP_URL', 'http://localhost'),
    'asset_url' => null,
    'groups' => [
        'web' => [
            'super.*',
            'login',
            'profile.*',
        ],
    ],
    'only' => [],
    'except' => [],
    'query_parameters' => true,
];
