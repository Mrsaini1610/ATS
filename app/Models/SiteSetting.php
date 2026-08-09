<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'enable_email',
        'enable_whatsapp',
        'site_email',
        'site_phone',
        'dark_logo_path',
        'light_logo_path',
        'favicon_path',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
        'site_name',
        'site_description',
        'timezone',
        'date_format',
        'time_format',
        'maintenance_mode',
        'maintenance_message',
        'meta_title',
        'meta_description',
        'meta_keywords'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'enable_email' => 'boolean',
        'enable_whatsapp' => 'boolean',
        'maintenance_mode' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the site settings.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

   protected function darkLogoUrl(): Attribute
{
    return Attribute::make(
        get: function () {
            if (!$this->dark_logo_path) {
                return null;
            }
            if (str_starts_with($this->dark_logo_path, 'http')) {
                return $this->dark_logo_path;
            }
            return Storage::url($this->dark_logo_path);
        }
    );
}

protected function lightLogoUrl(): Attribute
{
    return Attribute::make(
        get: function () {
            if (!$this->light_logo_path) {
                return null;
            }
            if (str_starts_with($this->light_logo_path, 'http')) {
                return $this->light_logo_path;
            }
            return Storage::url($this->light_logo_path);
        }
    );
}

protected function faviconUrl(): Attribute
{
    return Attribute::make(
        get: function () {
            if (!$this->favicon_path) {
                return null;
            }
            if (str_starts_with($this->favicon_path, 'http')) {
                return $this->favicon_path;
            }
            return Storage::url($this->favicon_path);
        }
    );
}
    /**
     * Scope a query to only include settings for the given user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public static function getAllSettings()
{
    return cache()->remember('site_settings', now()->addDays(1), function () {
        return self::all();
    });
}
}
