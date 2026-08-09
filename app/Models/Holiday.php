<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Holiday extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'super_admin_id',
        'date',
        'name',
        'description',
        'created_by',
        'role',
        'status',
    ];

    public function superAdmin()
    {
        return $this->belongsTo(SuperAdmin::class);
    }


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
