<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\FoursquareController;

Route::get('/api/weather', [WeatherController::class, 'getWeather']);
Route::get('/weather', [WeatherController::class, 'getWeather']);
Route::get('/places', [FoursquareController::class, 'getPlaces']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
