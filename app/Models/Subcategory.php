<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
    use HasFactory;

    protected $table = 'subcategories';

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'image',
        'status', // 1 = Active, 0 = Inactive
    ];

    /**
     * Subcategory kisi ek Parent Category se belong karti hai (Belongs-to Relationship)
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }
}