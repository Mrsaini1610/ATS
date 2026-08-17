<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserCertificate extends Model
{
    use HasFactory;

    protected $table = 'user_certificates';

    protected $fillable = [
        'uuid',
        'user_uuid',
        'title',
        'issuing_organization',
        'issue_date',
        'expiration_date',
        'credential_id',
        'credential_url'
    ];

    protected $casts = [
        'issue_date'      => 'date',
        'expiration_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }
}
