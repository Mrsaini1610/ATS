<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeLanguage extends Model
{
    use HasFactory;

    protected $table = 'resume_languages';

    protected $fillable = [
        'resume_id',
        'language',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}

