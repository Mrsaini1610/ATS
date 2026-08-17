<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Subcategory;

class JobPost extends Model
{
    use HasFactory;

    protected $table = 'job_posts';

    protected $fillable = [
        'uuid', 'company_id', 'category_id', 'sub_category_id', 'title',
        'company', 'company_about', 'company_size', 'description', 'location',
        'latitude', 'longitude', 'job_type', 'badge', 'openings', 'experience',
        'min_age', 'max_age', 'salary', 'skills', 'perks', 'key_responsibilities',
        'qualifications', 'assets', 'application_questions', 'last_date',
        'company_image', 'contact_person', 'contact_phone', 'contact_email',
        'company_address', 'applicants', 'status', 'created_by', 'approved_by',
        'approved_at', 'rejection_reason', 'resubmitted_at', 'approval_logs'
    ];

    protected $casts = [
        'latitude'              => 'decimal:8',
        'longitude'             => 'decimal:8',
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

    // Relationships
    public function company()
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

public function subCategory()
{
    return $this->belongsTo(Subcategory::class, 'sub_category_id');
}
}