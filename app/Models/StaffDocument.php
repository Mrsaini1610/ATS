<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffDocument extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'member_id',
        'role',
        'extension',
        'image_path',
        'super_admin_id',
    ];

    /**
     * Get the staff that owns the document.
     */
    public function member()
    {
        return $this->HashOne(Member::class,'id','member_id');
    }

     public function user()
    {
        return $this->hasOne(SuperAdmin::class,'id','super_admin_id');
    }
}
