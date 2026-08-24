<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    use HasFactory;

    protected $table = 'states';

    // The table only uses created_at, not updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'country_code',
        'country_name',
        'state_code',
        'type',
        'latitude',
        'longitude',
        'uuid',
    ];

    // Explicit type casts for numerical lat/long values
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}