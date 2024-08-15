<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class WeatherService
{
    protected $client;
    protected $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = env('OPENWEATHERMAP_API_KEY');
    }

    public function getWeatherData($city)
    {
        try {
            $response = $this->client->request('GET', 'https://api.openweathermap.org/data/2.5/forecast', [
                'query' => [
                    'q' => $city,
                    'appid' => $this->apiKey,
                    'units' => 'metric',
                ],
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            \Log::error('Error fetching weather data: ' . $e->getMessage());
            return null;
        }
    }
}
