<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeCertification extends Model
{
    use HasFactory;

    protected $table = 'resume_certifications';

    protected $fillable = [
        'resume_id',
        'title',
        'platform',
        'year',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}

