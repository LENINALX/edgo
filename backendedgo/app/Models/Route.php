<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'origin',
        'destination',
        'path',
        'status',
    ];

    /**
     * Get the transport units assigned to this route.
     */
    public function transportUnits()
    {
        return $this->hasMany(TransportUnit::class);
    }
}
