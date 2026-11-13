<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\Admin;

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
        'min_experience',
        'max_experience',
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
        'certifications',
        'preferred_industries',
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
        'assigned_to',
        'is_deleted',
    ];

    protected $casts = [
        'min_lpa'               => 'decimal:2',
        'max_lpa'               => 'decimal:2',
        'min_salary'            => 'decimal:2',
        'max_salary'            => 'decimal:2',
        'min_experience'        => 'decimal:2',
        'max_experience'        => 'decimal:2',
        'openings'              => 'integer',
        'min_age'               => 'integer',
        'max_age'               => 'integer',
        'applicants'            => 'integer',
        'is_deleted'            => 'boolean',
        'skills'                => 'array',
        'languages'             => 'array',
        'perks'                 => 'array',
        'key_responsibilities'  => 'array',
        'qualifications'        => 'array',
        'assets'                => 'array',
        'certifications'        => 'array',
        'preferred_industries'  => 'array',
        'application_questions' => 'array',
        'approval_logs'         => 'array',
        'last_date'             => 'date',
        'approved_at'           => 'datetime',
        'resubmitted_at'        => 'datetime',
    ];

    protected $appends = [
        'min_qualification',
    ];

    /**
     * Deduce minimum qualification requirement
     * Levels:
     * 0: Any / Below 10th
     * 1: 10th Pass
     * 2: 12th Pass
     * 3: Diploma / ITI
     * 4: Graduate
     * 5: Post Graduate
     * 6: Doctorate / PhD
     */
    public function getMinimumQualification(): array
    {
        $quals = $this->qualifications;
        if (is_string($quals)) {
            $quals = json_decode($quals, true) ?: [$quals];
        }
        $text = implode(' ', (array) ($quals ?: []));
        if (empty(trim($text))) {
            $text = ($this->title ?? '') . ' ' . ($this->description ?? '');
        }
        $lower = strtolower($text);

        // 1. Explicit 10th only
        if (preg_match('/\b(10th\s*pass|10th\s*standard|matric|high\s*school)\b/i', $lower)
            && !preg_match('/\b(12th|graduate|bachelor|degree|diploma|b\.tech|bca|mca|mba|master)\b/i', $lower)) {
            return ['label' => '10th Pass', 'level' => 1];
        }

        // 2. "10th or 12th"
        if (preg_match('/\b10th\s*(pass)?\s*(or|\/)\s*12th\b/i', $lower)) {
            return ['label' => '10th Pass', 'level' => 1];
        }

        // 3. "12th Pass or Graduate" -> minimum is 12th Pass!
        if (preg_match('/\b12th\s*(pass)?\s*(or|\/)\s*(graduate|bachelor|degree)\b/i', $lower)
            || (preg_match('/\b(12th\s*pass|12th\s*standard|intermediate|senior\s*secondary|10\+2)\b/i', $lower)
                && !preg_match('/\b(must\s*be\s*graduate|only\s*graduate|degree\s*mandatory)\b/i', $lower))) {
            return ['label' => '12th Pass', 'level' => 2];
        }

        // 4. Diploma / ITI
        if (preg_match('/\b(diploma|polytechnic|iti)\b/i', $lower)
            && !preg_match('/\b(only\s*graduate|bachelor\s*mandatory|master\s*only)\b/i', $lower)) {
            return ['label' => 'Diploma / ITI', 'level' => 3];
        }

        // 5. Graduate / Bachelor (e.g. B.Tech, BCA, B.Com, BBA, Bachelor, Degree, or "Bachelor or Master")
        if (preg_match('/\b(graduate|bachelor|b\.tech|b\.e|bca|b\.com|b\.sc|bba|degree)\b/i', $lower)) {
            return ['label' => 'Graduate', 'level' => 4];
        }

        // 6. Doctorate / PhD
        if (preg_match('/\b(phd|doctorate)\b/i', $lower)
            && !preg_match('/\b(bachelor|graduate|master|bs|ms)\b/i', $lower)) {
            return ['label' => 'Doctorate / PhD', 'level' => 6];
        }

        // 7. Post Graduate / Master / MBA
        if (preg_match('/\b(master|mba|m\.tech|mca|m\.com|m\.sc|post\s*graduate|pgdm)\b/i', $lower)) {
            return ['label' => 'Post Graduate', 'level' => 5];
        }

        return ['label' => '10th / 12th / Any', 'level' => 1];
    }

    public function getMinQualificationAttribute(): array
    {
        return $this->getMinimumQualification();
    }

    public function scopeActiveForCandidate($query)
    {
        return $query->whereIn('status', ['active', 'approved'])
            ->where(function ($q) {
                $q->where('is_deleted', 0)->orWhereNull('is_deleted');
            })
            ->where(function ($q) {
                $q->whereNull('last_date')
                  ->orWhereDate('last_date', '>=', now()->toDateString());
            });
    }

    /**
     * Auto-deactivate posts whose last_date has passed
     */
    public static function autoDeactivateExpiredPosts(): int
    {
        $today = now()->toDateString();
        return static::whereNotNull('last_date')
            ->whereDate('last_date', '<', $today)
            ->where(function ($q) {
                $q->where('status', '!=', 'deactivated')
                  ->orWhere('is_deleted', 0)
                  ->orWhereNull('is_deleted');
            })
            ->whereIn('status', ['active', 'approved', 'pending', 'hold'])
            ->update([
                'status'     => 'deactivated',
                'is_deleted' => 1,
                'updated_at' => now(),
            ]);
    }

    public function isExpired(): bool
    {
        if ($this->is_deleted) {
            return true;
        }
        if ($this->last_date) {
            return \Carbon\Carbon::parse($this->last_date)->endOfDay()->isPast();
        }
        return false;
    }

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
        return $this->belongsTo(Admin::class, 'created_by', 'id');
    }

    public function assignedMember()
    {
        return $this->belongsTo(Admin::class, 'assigned_to', 'id');
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'job_id', 'id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_uuid', 'uuid');
    }
}
