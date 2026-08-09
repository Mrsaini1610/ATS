<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class SiteSettingController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::first();
        return inertia('SuperAdmin/Settings/Index', [
            'settings' => $settings,
            'timezones' => \DateTimeZone::listIdentifiers(),
        ]);
    }
 public function list()
    {
        $settings = SiteSetting::first();
    return response()->json([
        'settings' => $settings,
        'success' => true
    ]);
    }
    public function update(Request $request)
    {
        $settings = SiteSetting::firstOrNew();

        $rules = [
            'site_name' => 'required|string|max:255',
            'site_email' => 'nullable|email|max:255',
            'site_phone' => 'nullable|string|max:20',
            'timezone' => 'required|timezone',
            'date_format' => 'required|string',
            'time_format' => 'required|string',
            'maintenance_mode' => 'boolean',
            'maintenance_message' => 'nullable|string',
            'site_description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'facebook_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'linkedin_url' => 'nullable|url',
            'dark_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'light_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:512',
        ];
        $validator = Validator::make($request->all(), array_intersect_key($rules, $request->all()));
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

    $data = $request->except(['dark_logo', 'light_logo', 'favicon']);
$data = $request->only([
    'site_name',
    'site_email',
    'site_phone',
    'timezone',
    'date_format',
    'time_format',
    'enable_email',
    'enable_whatsapp',
    'maintenance_mode',
    'maintenance_message',
    'site_description',
    'meta_title',
    'meta_description',
    'meta_keywords',
    'facebook_url',
    'twitter_url',
    'instagram_url',
    'linkedin_url'
]);
$data['enable_email'] = $request->input('enable_email') == 'true' ? 1 : 0;
    $data['enable_whatsapp'] = $request->input('enable_whatsapp') == 'true' ? 1 : 0;
    $data['maintenance_mode'] = $request->input('maintenance_mode') == 'true' ? 1 : 0;
       if ($request->hasFile('dark_logo')) {
        if ($settings->dark_logo_path && Storage::disk('public')->exists($settings->dark_logo_path)) {
            Storage::disk('public')->delete($settings->dark_logo_path);
        }
        $extension = $request->file('dark_logo')->getClientOriginalExtension();
        $filename = 'dark_logo_' . now()->format('Ymd_His') . '_' . Str::random(5) . '.' . $extension;
        $path = $request->file('dark_logo')->storeAs('site_settings', $filename, 'public');
        $data['dark_logo_path'] = $path;
    }
    if ($request->hasFile('light_logo')) {
        if ($settings->light_logo_path && Storage::disk('public')->exists($settings->light_logo_path)) {
            Storage::disk('public')->delete($settings->light_logo_path);
        }
        $extension = $request->file('light_logo')->getClientOriginalExtension();
        $filename = 'light_logo_' . now()->format('Ymd_His') . '_' . Str::random(5) . '.' . $extension;
        $path = $request->file('light_logo')->storeAs('site_settings', $filename, 'public');
        $data['light_logo_path'] = $path;
    }
    if ($request->hasFile('favicon')) {
        if ($settings->favicon_path && Storage::disk('public')->exists($settings->favicon_path)) {
            Storage::disk('public')->delete($settings->favicon_path);
        }
        $extension = $request->file('favicon')->getClientOriginalExtension();
        $filename = 'favicon_' . now()->format('Ymd_His') . '_' . Str::random(5) . '.' . $extension;
        $path = $request->file('favicon')->storeAs('site_settings', $filename, 'public');
        $data['favicon_path'] = $path;
    }

        $data['user_id'] = auth('superadmin')->id();

        $settings->fill($data);
        $settings->save();
        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'dark_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'light_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $field = $request->hasFile('dark_logo') ? 'dark_logo' : 'light_logo';
        $file = $request->file($field);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'No file uploaded'
            ], 400);
        }

        $path = $file->store('public/site_settings');
        $publicPath = Str::replaceFirst('public/', '', $path);

        return response()->json([
            'success' => true,
            'path' => $publicPath,
            'field' => $field,
            'full_url' => asset('storage/site_settings/' . $publicPath)
        ]);
    }
}
