<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    /**
     * Display a listing of all active transit routes.
     */
    public function index()
    {
        $routes = Route::withCount('transportUnits')
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $routes
        ]);
    }

    /**
     * Display details of a specific route with its units.
     */
    public function show($id)
    {
        $route = Route::with(['transportUnits.driver'])->find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Ruta no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $route
        ]);
    }
}
