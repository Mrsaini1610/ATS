<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserResume extends Model
{
    use HasFactory;

    protected $table = 'user_resumes';

    protected $fillable = [
        'uuid',
        'user_uuid',
        'title',
        'file_path',
        'file_type',
        'is_default',
        'is_delete',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_delete'  => 'integer',
    ];

    protected $appends = ['file_url'];

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

    public function getFileUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }
}
