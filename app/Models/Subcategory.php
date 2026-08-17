<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
    use HasFactory;

    protected $table = 'subcategories';

    protected $fillable = ['category_id', 'name', 'slug', 'status'];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function jobPosts()
    {
        return $this->hasMany(JobPost::class, 'sub_category_id');
    }
}