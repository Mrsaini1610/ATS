<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserExperience extends Model
{
    protected $table = 'user_experiences';

    protected $fillable = [
        'user_id',
        'company_name',
        'designation',
        'start_date',
        'end_date',
        'is_current',
        'description'
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
