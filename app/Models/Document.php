<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Document extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $fillable = [
        'uuid',
        'super_admin_id',
        'role',
        'image_path',
        'extension',
    ];

    /**
     * Boot method to auto-generate UUID.
     */
    public function uniqueIds()
    {
        return ['uuid'];
    }

    /**
     * Relationship: Document belongs to a User
     */
    public function user()
    {
        return $this->hasOne(SuperAdmin::class,'id','super_admin_id');
    }
}
