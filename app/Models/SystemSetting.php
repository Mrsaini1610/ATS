<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'value',
        'extra'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'extra' => 'array'
    ];

    protected $appends = [
        'last_updated_at'
    ];


    public function lastUpdatedAt(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->updated_at->format('h:i A d-m-Y')
        );
    }

    /**
     * Get a Settings Value
     *
     * @param string $name Setting Name
     * @param boolean $extra True if need Extra Column Value
     * @return string|bool|int|float|double
     */
    public static function getSettingValue($name, $extra = false)
    {
        $setting = self::firstOrCreate(['name' => $name]);
        if ($extra) return $setting->extra;
        return $setting->value;
    }

    /**
     * Update Setting Value
     *
     * @param string $name Name of Setting
     * @param string|bool|int|float|double $value Value of Setting
     * @param array $extra Extra values in Array
     * @return void
     */
    public static function setSettingValue($name, $value, $extra = null)
    {
        $setting = self::firstOrCreate(['name' => $name]);
        $setting->value = $value;
        if ($extra !== null) {
            $setting->extra = $extra;
        }
        $setting->save();
    }
}
