<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    use HasFactory;

    // Define the table name if it differs from the default plural form
    protected $table = 'states';

    // Specify the attributes that are mass assignable
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

    // Disable updated_at if your table only has created_at
    public $timestamps = false; 
}