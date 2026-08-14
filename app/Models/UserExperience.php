<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserExperience extends Model
{
    protected $table = 'user_experiences';

    protected $fillable = [
        'user_id',
        'company_name',
        'job_title', // या designation
        'start_date',
        'end_date',
        'location',
        'description',
        'is_current'
    ];


    protected $casts = [
        'is_current' => 'boolean',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];
}
