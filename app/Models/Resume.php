<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'job_title',
        'email',
        'phone',
        'location',
        'linkedin',
        'github',
        'portfolio',
        'summary',
        'profile_photo',
    ];

    public function skills()
    {
        return $this->hasMany(ResumeSkill::class);
    }

    public function experiences()
    {
        return $this->hasMany(ResumeExperience::class);
    }

    public function educations()
    {
        return $this->hasMany(ResumeEducation::class);
    }

    public function projects()
    {
        return $this->hasMany(ResumeProject::class);
    }

    public function certifications()
    {
        return $this->hasMany(ResumeCertification::class);
    }

    public function achievements()
    {
        return $this->hasMany(ResumeAchievement::class);
    }

    public function languages()
    {
        return $this->hasMany(ResumeLanguage::class);
    }
}

