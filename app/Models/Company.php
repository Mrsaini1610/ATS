<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;

    protected $table = 'companies';

    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'logo',
        'website',
        'location',
        'address',
        'company_size',
        'description',
        'status',
    ];

    protected $hidden = [
        'id',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    /**
     * Route model binding ke liye uuid use karein
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Company has many JobPosts
     */
    public function jobPosts()
    {
        return $this->hasMany(JobPost::class, 'company_id', 'id');
    }
}
