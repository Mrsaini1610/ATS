<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'status',
    ];

    protected $hidden = [
        'id',
    ];

    /**
     * Get the job posts associated with the category.
     */
    public function jobPosts(): HasMany
    {
        // Adjust JobPost::class to match your actual JobPost model name
        return $this->hasMany(JobPost::class, 'category_id', 'id');
    }
}
