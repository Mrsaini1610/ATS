<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserResume extends Model
{
    protected $table = 'user_resumes';
    protected $fillable = ['user_id', 'title', 'file_path', 'file_type', 'is_default'];
    protected $appends = ['file_url'];

public function getFileUrlAttribute()
{
    return $this->file_path ? asset('storage/' . $this->file_path) : null;
}
}
