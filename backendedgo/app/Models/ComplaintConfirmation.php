<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintConfirmation extends Model
{
    protected $fillable = ['complaint_id', 'user_id'];
}
