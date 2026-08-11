<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class SuperAdmin extends Authenticatable
{
    use HasUuids;
    protected $fillable = [
        'roles',
        'name',
        'email',
        'phone',
        'whatsapp_phone',
        'status',
        'username',
        'profile_image',
        'password',
        'reset_password_token_expires_at',
        'reset_password_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public static function boot()
    {
        parent::boot();
    }

    public function uniqueIds()
    {
        return ['uuid'];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
             'reset_password_token_expires_at' => 'datetime',
            'roles' => 'array',
        ];
    }

    protected $appends = [
        'profile_photo_url',
        'received_at',
    ];

    public function receivedAt(): Attribute
    {
        return Attribute::make(
            get: fn() => empty($this->created_at) ? '--/--/----' : $this->created_at->format('d-m-Y h:i A')
        );
    }

    // public function getProfilePhotoUrlAttribute()
    // {
    //     $photo = $this->profile_pic ?? null;

    //     if ($photo) {
    //         return asset('storage/users_photos/' . $photo);
    //     }
    //     $name = trim(collect(explode(' ', $this->name))->map(function ($segment) {
    //         return mb_substr($segment, 0, 1);
    //     })->join(' '));

    //     return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&color=B8EA3F&background=000000&size=128';
    // }

       public function notify_tokens()
    {
        return $this->hasMany(FcmToken::class, 'user_id');
    }

    public function fcm_token()
    {
        return $this->hasOne(FcmToken::class,'user_id')->latestOfMany();
    }
  public function profilePhotoUrl(): Attribute
{
    return Attribute::make(
        get: function () {
            if (!empty($this->profile_image)) {
                if (filter_var($this->profile_image, FILTER_VALIDATE_URL)) {
                    return $this->profile_image;
                }

                return Storage::disk('public')->url($this->profile_image);
            }

            return asset('images/profileimg.png');
        }
    );
}

 public function generatePasswordResetToken()
    {
        $this->reset_password_token = Str::random(60);
        $this->reset_password_token_expires_at = now()->addMinutes(10);
        $this->save();

        return $this->reset_password_token;
    }

    public function clearPasswordResetToken()
    {
        $this->reset_password_token = null;
        $this->reset_password_token_expires_at = null;
        $this->save();
    }

    public function isPasswordResetTokenValid()
    {
        return $this->reset_password_token &&
            $this->reset_password_token_expires_at &&
            $this->reset_password_token_expires_at->isFuture();
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'listing_id')
            ->where('model', 'superadmin');
    }

    public function unreadNotifications(): HasMany
    {
        return $this->notifications()
            ->where('status', 'unread')
            ->whereNull('viewed_at');
    }

    public function unreadNotificationsCount(): int
    {
        return $this->unreadNotifications()->count();
    }

    public function markNotificationAsRead(string $uuid): bool
    {
        $notification = $this->notifications()->where('uuid', $uuid)->first();
        if (!$notification) {
            return false;
        }

        $notification->update([
            'status' => 'read',
            'viewed_at' => $notification->viewed_at ?? now(),
        ]);

        return true;
    }

    public function markAllNotificationsAsRead(): int
    {
        return $this->unreadNotifications()->update([
            'status' => 'read',
            'viewed_at' => now(),
        ]);
    }

    public function deleteNotification(string $uuid): bool
    {
        $notification = $this->notifications()->where('uuid', $uuid)->first();
        if (!$notification) {
            return false;
        }

        $notification->delete();
        return true;
    }

    public function deleteAllNotifications(): int
    {
        return $this->notifications()->delete();
    }
}
