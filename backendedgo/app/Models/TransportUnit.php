<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_number',
        'plate',
        'capacity',
        'driver_id',
        'route_id',
        'driver_name',
        'route_name',
        'latitude',
        'longitude',
        'speed',
        'status',
    ];

    /**
     * Get the driver assigned to this unit.
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the route assigned to this unit.
     */
    public function route()
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    /**
     * Get the complaints made against this unit.
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
