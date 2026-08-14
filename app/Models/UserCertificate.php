<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCertificate extends Model
{
    protected $table = 'user_certificates'; // अपनी टेबल का नाम चेक कर लें

    protected $fillable = [
        'user_id',
        'title',
        'issuing_organization',
        'issue_date',
        'expiration_date',
        'credential_id',
        'credential_url'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
