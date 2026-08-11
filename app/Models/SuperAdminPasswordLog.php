<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class SuperAdminPasswordLog extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $table = 'super_admin_password_logs';

    protected $fillable = [
        'uuid',
        'email',
        'role',
        'new_password',
    ];

 public function uniqueIds()
    {
        return ['uuid'];
    }

      public function superAdmin()
    {
        return $this->belongsTo(SuperAdmin::class, 'email', 'email');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'email', 'email');
    }


}
