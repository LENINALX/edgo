<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Route;
use App\Models\TransportUnit;
use App\Models\Complaint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Usuarios de prueba con roles
        $admin = User::create([
            'name' => 'Admin EDGO',
            'email' => 'admin@edgo.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $driver1 = User::create([
            'name' => 'Juan Perez (Conductor)',
            'email' => 'juan@urbantrack.com',
            'password' => Hash::make('password123'),
            'role' => 'driver',
        ]);

        $driver2 = User::create([
            'name' => 'Maria Lopez (Conductora)',
            'email' => 'maria@urbantrack.com',
            'password' => Hash::make('password123'),
            'role' => 'driver',
        ]);

        $passenger = User::create([
            'name' => 'Diego Pasajero',
            'email' => 'diego@urbantrack.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        $communityUser = User::create([
            'name' => 'Ana Comunidad',
            'email' => 'ana@edgo.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        // 2. Crear Rutas de prueba
        $route1 = Route::create([
            'name' => 'Línea 101 - Sur a Norte',
            'origin' => 'Terminal Quitumbe',
            'destination' => 'Terminal Carcelén',
            'path' => json_encode([
                ['latitude' => -0.2889, 'longitude' => -78.5556], // Quitumbe
                ['latitude' => -0.2201, 'longitude' => -78.5123], // Centro
                ['latitude' => -0.1112, 'longitude' => -78.4789]  // Carcelén
            ]),
            'status' => 'active',
        ]);

        $route2 = Route::create([
            'name' => 'Línea 202 - Valles Express',
            'origin' => 'Cumbayá',
            'destination' => 'Playón de la Marín',
            'path' => json_encode([
                ['latitude' => -0.1989, 'longitude' => -78.4356], // Cumbayá
                ['latitude' => -0.2241, 'longitude' => -78.5089]  // La Marín
            ]),
            'status' => 'active',
        ]);

        // 3. Crear Unidades de transporte (Buses)
        $unit1 = TransportUnit::create([
            'unit_number' => 'Bus-05',
            'plate' => 'PBX-1024',
            'capacity' => 45,
            'driver_id' => $driver1->id,
            'route_id' => $route1->id,
            'driver_name' => $driver1->name,
            'route_name' => $route1->name,
            'latitude' => -0.2201,
            'longitude' => -78.5123,
            'status' => 'in_service',
        ]);

        $unit2 = TransportUnit::create([
            'unit_number' => 'Bus-12',
            'plate' => 'PBA-3088',
            'capacity' => 40,
            'driver_id' => $driver2->id,
            'route_id' => $route2->id,
            'driver_name' => $driver2->name,
            'route_name' => $route2->name,
            'latitude' => -0.1989,
            'longitude' => -78.4356,
            'status' => 'out_of_service',
        ]);

        // 4. Crear Quejas de prueba asociadas al pasajero
        Complaint::create([
            'user_id' => $passenger->id,
            'transport_unit_id' => $unit1->id,
            'title' => 'Exceso de velocidad',
            'description' => 'El bus de la unidad 05 iba a exceso de velocidad en la avenida principal cerca de la parada Centro.',
            'category' => 'speed',
            'status' => 'pending',
        ]);

        Complaint::create([
            'user_id' => $communityUser->id,
            'transport_unit_id' => $unit1->id,
            'title' => 'Unidad en mal estado',
            'description' => 'La unidad tenía varios asientos deteriorados y una de sus puertas hacía mucho ruido durante el recorrido.',
            'category' => 'Unidad en mal estado',
            'status' => 'pending',
        ]);

        Complaint::create([
            'user_id' => $passenger->id,
            'transport_unit_id' => $unit2->id,
            'title' => 'Retraso de más de 30 minutos',
            'description' => 'La unidad 12 no pasó a la hora establecida en la parada de Cumbayá, causando que se acumule mucha gente.',
            'category' => 'delay',
            'status' => 'reviewing',
        ]);

        $this->command->info('Base de datos inicializada con datos de prueba.');
    }
}
