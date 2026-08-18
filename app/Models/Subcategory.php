<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subcategory extends Model
{
    use HasFactory;

    protected $table = 'subcategories';

    protected $fillable = [
        'uuid',
        'category_id',
        'name',
        'slug',
        'status',
    ];

    /**
     * Boot function to automatically generate UUID on creation
     */
    protected static function booted()
    {
        static::creating(function ($subcategory) {
            if (empty($subcategory->uuid)) {
                $subcategory->uuid = (string) Str::uuid();
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function jobPosts()
    {
        return $this->hasMany(JobPost::class, 'sub_category_id');
    }
}
