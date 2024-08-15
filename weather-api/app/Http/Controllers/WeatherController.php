<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    protected $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    public function getWeather(Request $request)
    {
        $city = $request->input('city', 'London');
        $weatherData = $this->weatherService->getWeatherData($city);

        if ($weatherData) {
            return response()->json($weatherData);
        }

        return response()->json(['error' => 'Unable to fetch weather data'], 500);
    }
}
    