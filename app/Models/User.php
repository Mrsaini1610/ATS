<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Ramsey\Uuid\Uuid;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $fillable = [
        'uuid',
        'name',
        'email',
        'phone',
        'whatsapp_phone',
        'password',
        'status',
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

    public static function boot(): void
    {
        parent::boot();
        static::creating(function ($v) {
            $v->uuid = Uuid::uuid4();
        });
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

    public function getProfilePhotoUrlAttribute()
    {
        $photo = $this->profile_pic ?? null;

        if ($photo) {
            return asset('storage/users_photos/' . $photo);
        }
        $name = trim(collect(explode(' ', $this->name))->map(function ($segment) {
            return mb_substr($segment, 0, 1);
        })->join(' '));

        return 'https://ui-av~atars.com/api/?name=' . urlencode($name) . '&color=B8EA3F&background=000000&size=128';
    }
}
