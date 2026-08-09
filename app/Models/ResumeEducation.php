<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeEducation extends Model
{
    use HasFactory;

    protected $table = 'resume_educations';

    protected $fillable = [
        'resume_id',
        'degree',
        'institute',
        'start_year',
        'end_year',
        'percentage',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}

