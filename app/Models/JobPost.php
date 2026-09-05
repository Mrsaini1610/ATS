<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class JobPost extends Model
{
    use HasFactory;

    protected $table = 'job_posts';

    protected $fillable = [
        'uuid', 'company_id', 'category_id', 'sub_category_id', 'title',
        'company', 'company_about', 'company_size', 'description', 'location',
        'latitude', 'longitude', 'job_type', 'badge', 'openings', 'experience',
        'min_age', 'max_age', 'min_lpa', 'max_lpa', 'salary_type', 'skills', 'perks',
        'key_responsibilities', 'qualifications', 'assets', 'application_questions',
        'last_date', 'company_image', 'contact_person', 'contact_phone',
        'contact_email', 'company_address', 'applicants', 'status', 'created_by',
        'approved_by', 'approved_at', 'rejection_reason', 'resubmitted_at', 'approval_logs'
    ];

    protected $casts = [
        'latitude'              => 'decimal:8',
        'longitude'             => 'decimal:8',
        'min_lpa'               => 'decimal:2',
        'max_lpa'               => 'decimal:2',
        'openings'              => 'integer',
        'min_age'               => 'integer',
        'max_age'               => 'integer',
        'applicants'            => 'integer',
        'skills'                => 'array',
        'perks'                 => 'array',
        'assets'                => 'array',
        'application_questions' => 'array',
        'approval_logs'         => 'array',
        'last_date'             => 'date',
        'approved_at'           => 'datetime',
        'resubmitted_at'        => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($job) {
            if (empty($job->uuid)) {
                $job->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function companyRelation()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }
    // Assigned Member / Approver relationship
    public function assignedMember()
    {
        return $this->belongsTo(Admin::class, 'approved_by', 'id');
    }
}
