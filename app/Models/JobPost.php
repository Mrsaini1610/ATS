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
        'uuid',
        'company_uuid', // <-- Yeh yahan add kiya gaya hai
        'company_id',
        'category_id',
        'sub_category_id',
        'title',
        'company',
        'company_about',
        'company_size',
        'description',
        'location',
        'latitude',
        'longitude',
        'job_type',
        'working_days',
        'shift_timing',
        'badge',
        'openings',
        'experience',
        'min_age',
        'max_age',
        'min_salary',
        'max_salary',
        'salary_type',
        'bonus_offered',
        'skills',
        'languages',
        'perks',
        'key_responsibilities',
        'qualifications',
        'assets',
        'application_questions',
        'last_date',
        'company_image',
        'contact_person',
        'contact_phone',
        'contact_email',
        'company_address',
        'applicants',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'resubmitted_at',
        'approval_logs',
        'interview_details',
        'assigned_to'
    ];

    protected $casts = [
        'min_lpa'               => 'decimal:2',
        'max_lpa'               => 'decimal:2',
        'openings'              => 'integer',
        'min_age'               => 'integer',
        'max_age'               => 'integer',
        'applicants'            => 'integer',
        'skills'                => 'array',
        'languages'             => 'array',
        'perks'                 => 'array',
        'key_responsibilities'  => 'array',
        'qualifications'        => 'array',
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
        return $this->belongsTo(Company::class, 'company_uuid', 'uuid');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function assignedMember()
    {
        return $this->belongsTo(Admin::class, 'assigned_to', 'id');
    }
}
