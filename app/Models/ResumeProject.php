<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeProject extends Model
{
    use HasFactory;

    protected $table = 'resume_projects';

    protected $fillable = [
        'resume_id',
        'title',
        'technologies',
        'project_link',
        'description',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}

