<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\TransportUnitController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\RoutePreferenceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas Públicas de Autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas Públicas de Información
Route::get('/routes', [RouteController::class, 'index']);
Route::get('/routes/{id}', [RouteController::class, 'show']);
Route::get('/units', [TransportUnitController::class, 'index']);
Route::get('/units/{id}', [TransportUnitController::class, 'show']);

// Rutas Protegidas por Token (Laravel Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Perfil y Cierre de Sesión
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/subscription', [SubscriptionController::class, 'show']);
    Route::post('/subscription/plan', [SubscriptionController::class, 'selectPlan']);
    Route::get('/route-preferences', [RoutePreferenceController::class, 'show']);
    Route::put('/route-preferences', [RoutePreferenceController::class, 'update']);

    // Gestión de Denuncias / Quejas (Complaints)
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints/community', [ComplaintController::class, 'community']);
    Route::post('/complaints/{id}/confirm', [ComplaintController::class, 'toggleConfirmation']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);

    Route::middleware('admin')->group(function () {
        Route::post('/units', [TransportUnitController::class, 'store']);
        Route::put('/units/{id}', [TransportUnitController::class, 'update']);
        Route::delete('/units/{id}', [TransportUnitController::class, 'destroy']);
        Route::get('/admin/complaints', [ComplaintController::class, 'adminIndex']);
        Route::patch('/admin/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    });
    Route::patch('/units/{id}/location', [TransportUnitController::class, 'updateLocation']);
    Route::patch('/units/{id}/status', [TransportUnitController::class, 'updateStatus']);
});
