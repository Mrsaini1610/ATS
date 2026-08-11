<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageActionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'super_admin_id',
        'image_url',
        'action',
    ];

    /**
     * Relation: the super admin who performed the action
     */
    public function superAdmin()
    {
        return $this->belongsTo(SuperAdmin::class);
    }
}
