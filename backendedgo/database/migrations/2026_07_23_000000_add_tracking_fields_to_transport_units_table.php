<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transport_units', function (Blueprint $table) {
            $table->string('driver_name')->nullable()->after('driver_id');
            $table->string('route_name')->nullable()->after('route_id');
            $table->decimal('latitude', 10, 7)->nullable()->after('route_name');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->unsignedSmallInteger('speed')->default(0)->after('longitude');
            $table->string('status')->default('out_of_service')->after('speed');
        });
    }

    public function down(): void
    {
        Schema::table('transport_units', function (Blueprint $table) {
            $table->dropColumn(['driver_name', 'route_name', 'latitude', 'longitude', 'speed', 'status']);
        });
    }
};
