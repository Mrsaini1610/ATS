<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserExperience extends Model
{
    use HasFactory;

    protected $table = 'user_experiences';

    protected $fillable = [
        'uuid',
        'user_uuid',
        'company_name',
        'designation',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'is_delete',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'is_delete'  => 'integer',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            if (!isset($model->is_delete)) {
                $model->is_delete = 0;
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }
}
