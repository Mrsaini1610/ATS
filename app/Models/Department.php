<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;

class Department extends Model
{
        use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'slug',
        'name',
        'status',
        'created_by',
    ];
     public function uniqueIds()
    {
        return ['uuid'];
    }


    public function creator()
    {
        return $this->belongsTo(SuperAdmin::class, 'created_by');
    }

    public function designationList(){
return $this->hasMany(Designation::class, 'department_id', 'id');
    }
}

