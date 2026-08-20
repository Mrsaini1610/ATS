<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'id', // ID hide rakhne ke liye agar frontend par sirf uuid bhejni ho
    ];
}
