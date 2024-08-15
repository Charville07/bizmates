<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class FoursquareController extends Controller
{
    private $foursquareApiKey;

    public function __construct()
    {
        // Load the Foursquare API key from the .env file
        $this->foursquareApiKey = env('FOURSQUARE_API_KEY');
    }

    public function getPlaces(Request $request)
    {
        $city = $request->query('city');

        if (!$city) {
            return response()->json(['error' => 'City parameter is required'], 400);
        }

        try {
            $client = new Client();

            // Make the request to Foursquare API
            $response = $client->request('GET', 'https://api.foursquare.com/v3/places/search', [
                'headers' => [
                    'Authorization' => 'fsq3yXmcXnHG/pObDSNxI1lV8DWHULQ7HBufIQSc2QkHzHA=',  // Use the API key from the environment variable
                    'accept' => 'application/json',
                ],
                'query' => [
                    'near' => $city,
                    'limit' => 10,  // Use the city from the query parameter
                    // You can add other query parameters here as needed
                ],
            ]);

            // Get the status code and body of the response
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);

            // Return the response in JSON format
            return response()->json($body, $statusCode);

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // Handle client exceptions (e.g., 4xx errors)
            return response()->json([
                'error' => 'Client error occurred',
                'message' => $e->getMessage()
            ], $e->getCode());

        } catch (\GuzzleHttp\Exception\ServerException $e) {
            // Handle server exceptions (e.g., 5xx errors)
            return response()->json([
                'error' => 'Server error occurred',
                'message' => $e->getMessage()
            ], $e->getCode());

        } catch (\Exception $e) {
            // Handle general exceptions
            return response()->json([
                'error' => 'An unexpected error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
