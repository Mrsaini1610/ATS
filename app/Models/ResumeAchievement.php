<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeAchievement extends Model
{
    use HasFactory;

    protected $table = 'resume_achievements';

    protected $fillable = [
        'resume_id',
        'title',
        'description',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}

