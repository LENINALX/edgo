<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\TransportUnit;

class AuthController extends Controller
{
    /**
     * Register a new passenger user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|in:user,driver',
            'transport_unit_id' => 'nullable|exists:transport_units,id',
            'subscription_plan' => 'nullable|in:free,economico,plus',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->input('role', 'user'),
            'subscription_plan' => $request->input('subscription_plan', 'free'),
        ]);

        if ($user->role === 'driver' && $request->transport_unit_id) {
            TransportUnit::whereKey($request->transport_unit_id)->update(['driver_id' => $user->id]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load(['transportUnit', 'selectedRoutes:id,name,origin,destination'])
        ], 201);
    }

    /**
     * Authenticate user and generate API token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load(['transportUnit', 'selectedRoutes:id,name,origin,destination'])
        ]);
    }

    /**
     * Revoke active user token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Get the authenticated user profile.
     */
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()->load(['transportUnit', 'selectedRoutes:id,name,origin,destination'])
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $user = $request->user();
        $user->update(['name' => $request->name]);
        return response()->json(['success' => true, 'user' => $user->fresh()->load(['transportUnit', 'selectedRoutes:id,name,origin,destination'])]);
    }
}
