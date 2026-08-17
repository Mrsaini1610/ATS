<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserEducation extends Model
{
    use HasFactory;

    protected $table = 'user_educations';

    protected $fillable = [
        'uuid',
        'user_uuid',
        'degree',
        'institution',
        'field_of_study',
        'start_year',
        'end_year',
        'percentage_or_cgpa',
        'is_delete',
    ];

    protected $casts = [
        'start_year' => 'integer',
        'end_year'   => 'integer',
        'is_delete'  => 'integer',
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
