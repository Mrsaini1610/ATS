<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserResume extends Model
{
    protected $table = 'user_resumes';
    protected $fillable = ['user_id', 'title', 'file_path', 'file_type', 'is_default'];
}
