<?php

namespace Database\Seeders;

use App\Models\Route;
use App\Models\TransportUnit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/** Datos demostrativos para EDGO Manta. No representan horarios oficiales. */
class MantaDemoSeeder extends Seeder
{
    public function run(): void
    {
        $lines = [
            ['1-B', 'Terminal Terrestre', 'Los Esteros', -0.9571, -80.7202],
            ['2', 'Terminal Terrestre', 'San Mateo', -0.9563, -80.7474],
            ['3', 'Terminal Terrestre', 'La Pradera', -0.9504, -80.7331],
            ['4', 'Terminal Terrestre', 'Tarqui', -0.9492, -80.7240],
            ['10', 'Terminal Terrestre', 'San Juan', -0.9717, -80.7675],
            ['12', 'Terminal Terrestre', 'Colorado', -0.9385, -80.7498],
            ['16-A', 'Terminal Terrestre', 'Montecristi', -1.0462, -80.6580],
            ['16', 'Terminal Terrestre', 'Jaramijó', -0.9165, -80.6104],
            ['1-A', 'Centro de Manta', 'Terminal Terrestre', -0.9518, -80.7357],
            ['5', 'Los Bajos', 'Terminal Terrestre', -0.9784, -80.7376],
        ];

        $drivers = [
            ['carlos.vera@gmail.com', 'Carlos Vera', 'carlos123'],
            ['maria.lopez@gmail.com', 'María López', 'maria123'],
            ['jose.mendoza@gmail.com', 'José Mendoza', 'jose123'],
            ['ana.paz@gmail.com', 'Ana Paz', 'ana123'],
            ['luis.ortiz@gmail.com', 'Luis Ortiz', 'luis123'],
            ['sofia.mora@gmail.com', 'Sofía Mora', 'sofia123'],
            ['diego.cedeño@gmail.com', 'Diego Cedeño', 'diego123'],
            ['elena.vera@gmail.com', 'Elena Vera', 'elena123'],
            ['pablo.zambrano@gmail.com', 'Pablo Zambrano', 'pablo123'],
            ['rosa.macias@gmail.com', 'Rosa Macías', 'rosa123'],
        ];

        foreach (['valeria.santos@gmail.com' => ['Valeria Santos', 'valeria123'], 'andres.moreira@gmail.com' => ['Andrés Moreira', 'andres123'], 'lucia.mendoza@gmail.com' => ['Lucía Mendoza', 'lucia123']] as $email => [$name, $password]) {
            User::firstOrCreate(['email' => $email], ['name' => $name, 'password' => Hash::make($password), 'role' => 'user', 'subscription_plan' => 'free']);
        }

        foreach ($lines as $index => [$number, $origin, $destination, $lat, $lng]) {
            $route = Route::firstOrCreate(
                ['name' => "Línea {$number} · Manta"],
                ['origin' => $origin, 'destination' => $destination, 'path' => json_encode([['latitude' => -0.9510, 'longitude' => -80.7320], ['latitude' => $lat, 'longitude' => $lng]]), 'status' => 'active']
            );

            [$email, $driverName, $password] = $drivers[$index];
            $driver = User::firstOrCreate(['email' => $email], ['name' => $driverName, 'password' => Hash::make($password), 'role' => 'driver', 'subscription_plan' => 'free']);

            TransportUnit::updateOrCreate(
                ['unit_number' => 'MTA-' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)],
                ['plate' => 'MTA-' . str_pad((string) (101 + $index), 3, '0', STR_PAD_LEFT), 'capacity' => 40, 'driver_id' => $driver->id, 'route_id' => $route->id, 'driver_name' => $driverName, 'route_name' => $route->name, 'latitude' => $lat, 'longitude' => $lng, 'speed' => 18 + ($index % 5) * 4, 'status' => $index % 4 === 0 ? 'out_of_service' : 'in_service']
            );
        }

        $this->command->info('Se agregaron rutas, unidades y usuarios demostrativos de Manta para EDGO.');
    }
}
