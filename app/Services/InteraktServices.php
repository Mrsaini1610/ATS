<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class InteraktServices
{
    private $api_key;
    private $app_url;
    private $app_version;

    public function __construct()
    {
        $this->api_key = env('INTERAKT_SECRET_KEY');
        $this->app_url = env('INTERAKT_URL');
        $this->app_version = env('INTERAKT_VERSION');
    }

    /**
     * Send Message
     * @param array $msgData
     * @return array
     */
    public function sendMessage($msgData)
    {
        $req = Http::withHeaders([
            'Content-Type'  => 'application/json',
            'Authorization' => 'Basic '.$this->api_key,
        ])->post($this->app_url . '/' . $this->app_version . '/public/message/', $msgData);

        if ($req->successful()) {
            return [
                'status' => true,
                'result' => $req->json()
            ];
        }

        return [
            'status' => false,
            'result' => $req->json()
        ];
    }
}
