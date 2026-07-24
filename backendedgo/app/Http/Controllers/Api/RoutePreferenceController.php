<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RoutePreferenceController extends Controller
{
    public function show(Request $request)
    {
        return response()->json(['success' => true, 'data' => $request->user()->selectedRoutes()->get(['routes.id', 'name', 'origin', 'destination'])]);
    }

    public function update(Request $request)
    {
        $data = $request->validate(['route_ids' => 'required|array|min:1', 'route_ids.*' => 'integer|exists:routes,id']);
        $user = $request->user();
        $limit = SubscriptionController::benefits($user->subscription_plan)['route_limit'];
        if ($limit !== null && count($data['route_ids']) > $limit) {
            return response()->json(['success' => false, 'message' => "Tu plan permite seleccionar hasta {$limit} ruta(s)."], 422);
        }

        $user->selectedRoutes()->sync($data['route_ids']);
        return response()->json(['success' => true, 'data' => $user->selectedRoutes()->get(['routes.id', 'name', 'origin', 'destination'])]);
    }
}
