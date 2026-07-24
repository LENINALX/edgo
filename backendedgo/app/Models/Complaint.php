<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transport_unit_id',
        'title',
        'description',
        'category',
        'status',
    ];

    /**
     * Get the passenger user who made the complaint.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transport unit associated with the complaint.
     */
    public function transportUnit()
    {
        return $this->belongsTo(TransportUnit::class);
    }

    public function confirmations()
    {
        return $this->hasMany(ComplaintConfirmation::class);
    }
}
