<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPost extends Model
{
    use HasFactory;

    // Database Table Name
    protected $table = 'job_posts';

    // Primary Key
    protected $primaryKey = 'id';

    // Mass Assignable Fields
    protected $fillable = [
        'uuid',
        'title',
        'company',
        'company_about',
        'company_size',
        'description',
        'location',
        'latitude',
        'longitude',
        'job_type',
        'category_id',
        'sub_category_id',
        'badge',
        'openings',
        'experience',
        'min_age',
        'max_age',
        'salary',
        'skills',
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
    ];

    // Data Casting (JSON aur Dates auto-format karne ke liye)
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'openings' => 'integer',
        'min_age' => 'integer',
        'max_age' => 'integer',
        'applicants' => 'integer',
        'skills' => 'array',
        'perks' => 'array',
        'assets' => 'array',
        'application_questions' => 'array',
        'approval_logs' => 'array',
        'last_date' => 'date',
        'approved_at' => 'datetime',
        'resubmitted_at' => 'datetime',
    ];

    // Relationships Examples (Aapki zarurat ke hisaab se)
    
    /**
     * User jisne job post ki h
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Admin/User jisne job approve ki h
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Category Relationship (Agar Category model banaya hai)
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Sub Category Relationship
     */
    public function subCategory()
    {
        return $this->belongsTo(Category::class, 'sub_category_id');
    }
}