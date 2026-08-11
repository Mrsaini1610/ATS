<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Services\GeocodingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    private function getProfileCompletionData($member): array
    {
        $weights = [
            'name' => 15,
            'email' => 10,
            'phone' => 10,
            'username' => 5,
            'image' => 10,
            'dob' => 5,
            'gender' => 5,
            'skills' => 8,
            'overview' => 8,
            'education' => 8,
            'projects' => 6,
            'experience' => 10,
        ];

        $candidate = is_array($member->candidate_profile) ? $member->candidate_profile : [];

        $checks = [
            'name' => !empty($member->name),
            'email' => !empty($member->email),
            'phone' => !empty($member->phone),
            'username' => !empty($member->username),
            'image' => !empty($member->image),
            'dob' => !empty($member->dob),
            'gender' => !empty($member->gender),
            'skills' => !empty($candidate['skills']),
            'overview' => !empty($candidate['overview']),
            'education' => !empty($candidate['education']),
            'projects' => !empty($candidate['projects']),
            'experience' => array_key_exists('is_fresher', $candidate)
                ? ($candidate['is_fresher'] ? true : !empty($candidate['experience']))
                : false,
        ];

        $totalWeight = array_sum($weights);
        $score = 0;
        $missing = [];

        foreach ($weights as $key => $weight) {
            if (!empty($checks[$key])) {
                $score += $weight;
            } else {
                $missing[] = $key;
            }
        }

        $percentage = $totalWeight > 0 ? (int) floor(($score / $totalWeight) * 100) : 0;

        return [
            'percentage' => $percentage,
            'missing_fields' => $missing,
        ];
    }

    public function show(Request $request)
    {
        return response()->json([
            'success' => true,
            'member' => $request->user(),
        ]);
    }

    public function update(Request $request, GeocodingService $geocodingService)
    {
        $member = $request->user();

        $this->validateFileUpload($request, 'image', 4096);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
            ],
            'dob' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', 'nullable', Rule::in(['male', 'female', 'other'])],
            'image' => ['sometimes', 'nullable', 'file', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'candidate_profile' => ['sometimes', 'array'],
            'job_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'experience' => ['sometimes', 'nullable', 'string', 'max:100'],
            'overview' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'is_fresher' => ['sometimes', 'boolean'],
            'skills' => ['sometimes', 'array'],
            'skills.*' => ['string', 'max:50'],
            'latitude' => ['sometimes', 'nullable', 'decimal:6,8', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'decimal:6,8', 'between:-180,180'],
            'current_address' => ['sometimes', 'nullable', 'string', 'max:255'],
        ], [
            'image.uploaded' => 'The image failed to upload. The file size may exceed the server upload limit (maximum 4MB).',
            'image.max' => 'The image size must not exceed 4MB.',
            'image.mimes' => 'The image must be a valid JPG, JPEG, PNG, or WEBP file.',
        ]);

        if ($request->hasFile('image')) {
            $this->deleteMemberImage($member->image);
            $path = Storage::disk('public')->putFile('members', $request->file('image'));
            $validated['image'] = $path;
        }

        $candidate = is_array($member->candidate_profile) ? $member->candidate_profile : [];

        if (array_key_exists('candidate_profile', $validated) && is_array($validated['candidate_profile'])) {
            $candidate = array_replace_recursive($candidate, $validated['candidate_profile']);
        }
        if (array_key_exists('skills', $validated)) {
            $candidate['skills'] = $validated['skills'];
        }
        if (array_key_exists('overview', $validated)) {
            $candidate['overview'] = $validated['overview'];
        }
        if (array_key_exists('is_fresher', $validated)) {
            $candidate['is_fresher'] = (bool) $validated['is_fresher'];
        }
        if (array_key_exists('job_title', $validated)) {
            $candidate['job_title'] = $validated['job_title'];
        }
        if (array_key_exists('location', $validated)) {
            $candidate['location'] = $validated['location'];
        }
        if (array_key_exists('experience', $validated)) {
            $candidate['experience_label'] = $validated['experience'];
        }

        $validated['candidate_profile'] = $candidate;

        if (array_key_exists('phone', $validated) && $validated['phone'] !== $member->phone) {
            $validated['phone_verify_at'] = null;
        }

        $this->syncLocationPayload(
            $validated,
            $geocodingService,
            $validated['current_address'] ?? $validated['location'] ?? null
        );

        $member->fill($validated)->save();

        return response()->json([
            'success' => true,
            'member' => $member->fresh(),
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $member = $request->user();

        $this->validateFileUpload($request, 'photo', 4096);

        $validated = $request->validate([
            'photo' => ['required', 'file', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ], [
            'photo.uploaded' => 'The photo failed to upload. The file size may exceed the server upload limit (maximum 4MB).',
            'photo.max' => 'The photo size must not exceed 4MB.',
            'photo.mimes' => 'The photo must be a valid JPG, JPEG, PNG, or WEBP file.',
        ]);

        $this->deleteMemberImage($member->image);
        $path = Storage::disk('public')->putFile('members', $validated['photo']);

        $member->forceFill([
            'image' => $path,
        ])->save();

        return response()->json([
            'success' => true,
            'member' => $member->fresh(),
        ]);
    }

    public function removePhoto(Request $request)
    {
        $member = $request->user();

        $this->deleteMemberImage($member->image);

        $member->forceFill([
            'image' => null,
        ])->save();

        return response()->json([
            'success' => true,
            'member' => $member->fresh(),
        ]);
    }

    public function resume(Request $request)
    {
        $member = $request->user();
        $hasResume = !empty($member->resume_path) && (
            Storage::disk('public')->exists($member->resume_path) || Storage::disk('local')->exists($member->resume_path)
        );

        return response()->json([
            'success' => true,
            'has_resume' => $hasResume,
            'resume' => $hasResume ? [
                'original_name' => $member->resume_original_name,
                'mime' => $member->resume_mime,
                'size' => $member->resume_size,
                'uploaded_at' => optional($member->resume_uploaded_at)->toISOString(),
                'view_url' => $this->buildResumeViewUrl($request),
                'path' => $member->resume_path,
                'url' => $member->resume_url,
            ] : null,
        ]);
    }

    public function uploadResume(Request $request)
    {
        $member = $request->user();

        $this->validateFileUpload($request, 'resume', 5120);

        $validated = $request->validate([
            'resume' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ], [
            'resume.uploaded' => 'The resume failed to upload. The file size may exceed the server upload limit (maximum 5MB).',
            'resume.max' => 'The resume size must not exceed 5MB.',
            'resume.mimes' => 'The resume must be a PDF, DOC, or DOCX file.',
        ]);

        $this->deleteMemberResume($member->resume_path);

        $file = $validated['resume'];
        $extension = $file->getClientOriginalExtension() ?: 'pdf';
        $path = 'member-resumes/' . $member->uuid . '/' . Str::uuid() . '.' . $extension;
        Storage::disk('public')->putFileAs(dirname($path), $file, basename($path));

        $member->forceFill([
            'resume_path' => $path,
            'resume_original_name' => $file->getClientOriginalName(),
            'resume_mime' => $file->getClientMimeType(),
            'resume_size' => $file->getSize(),
            'resume_uploaded_at' => now(),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Resume uploaded.',
            'resume' => [
                'original_name' => $member->resume_original_name,
                'mime' => $member->resume_mime,
                'size' => $member->resume_size,
                'uploaded_at' => optional($member->resume_uploaded_at)->toISOString(),
                'view_url' => $this->buildResumeViewUrl($request),
                'path' => $member->resume_path,
                'url' => $member->resume_url,
            ],
        ]);
    }

    public function deleteResume(Request $request)
    {
        $member = $request->user();

        $this->deleteMemberResume($member->resume_path);

        $member->forceFill([
            'resume_path' => null,
            'resume_original_name' => null,
            'resume_mime' => null,
            'resume_size' => null,
            'resume_uploaded_at' => null,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Resume deleted.',
        ]);
    }

    public function viewResume(Request $request)
    {
        $member = $request->user();

        if (empty($member->resume_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Resume not found.',
            ], 404);
        }

        if (Storage::disk('public')->exists($member->resume_path)) {
            $fullPath = Storage::disk('public')->path($member->resume_path);
        } elseif (Storage::disk('local')->exists($member->resume_path)) {
            $fullPath = Storage::disk('local')->path($member->resume_path);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Resume not found.',
            ], 404);
        }

        $mime = $member->resume_mime ?: 'application/octet-stream';
        $filename = $member->resume_original_name ?: 'resume';
        $filename = str_replace(['"', "\n", "\r"], '', $filename);

        return response()->file($fullPath, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    public function completion(Request $request)
    {
        $member = $request->user();
        $data = $this->getProfileCompletionData($member);

        return response()->json([
            'success' => true,
            'completion_percentage' => $data['percentage'],
            'missing_fields' => $data['missing_fields'],
            'min_required' => 35,
        ]);
    }

    public function updateLocation(Request $request, GeocodingService $geocodingService)
    {
        $member = $request->user();

        $validated = $request->validate([
            'latitude' => ['required', 'decimal:6,8', 'between:-90,90'],
            'longitude' => ['required', 'decimal:6,8', 'between:-180,180'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['current_address'] = $validated['address'] ?? null;
        unset($validated['address']);

        $this->syncLocationPayload($validated, $geocodingService, $validated['current_address'] ?? null);

        $member->forceFill([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'current_address' => $validated['current_address'] ?? null,
        ])->save();

        return response()->json([
            'success' => true,
            'member' => $member->fresh(),
            'current_address' => $member->current_address,
        ]);
    }

    private function deleteMemberImage(?string $image): void
    {
        if (empty($image)) {
            return;
        }

        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return;
        }

        $path = ltrim($image, '/');
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        if ($path !== '' && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function deleteMemberResume(?string $resumePath): void
    {
        if (empty($resumePath)) {
            return;
        }

        if (Storage::disk('public')->exists($resumePath)) {
            Storage::disk('public')->delete($resumePath);
        }

        if (Storage::disk('local')->exists($resumePath)) {
            Storage::disk('local')->delete($resumePath);
        }
    }

    private function buildResumeViewUrl(Request $request): string
    {
        $base = rtrim($request->getSchemeAndHttpHost(), '/');

        return $base . '/api/profile/resume/view';
    }

    private function syncLocationPayload(array &$payload, GeocodingService $geocodingService, ?string $address = null): void
    {
        $this->normalizeCoordinateFields($payload);

        $hasCoordinates = isset($payload['latitude'], $payload['longitude'])
            && $payload['latitude'] !== null
            && $payload['longitude'] !== null;

        $address = trim((string) $address);

        if ($hasCoordinates) {
            $geoResult = $geocodingService->reverseGeocodeResult((float) $payload['latitude'], (float) $payload['longitude']);
            if (! empty($geoResult['formatted_address'])) {
                $payload['current_address'] = $geoResult['formatted_address'];
            } elseif ($address !== '') {
                $payload['current_address'] = $address;
            }

            return;
        }

        if ($address === '') {
            return;
        }

        $geoResult = $geocodingService->geocodeAddress($address);
        if (! is_array($geoResult)) {
            $payload['current_address'] = $address;
            return;
        }

        if (isset($geoResult['latitude'], $geoResult['longitude'])) {
            $payload['latitude'] = round((float) $geoResult['latitude'], 6);
            $payload['longitude'] = round((float) $geoResult['longitude'], 6);
        }

        $payload['current_address'] = $geoResult['formatted_address'] ?? $address;
    }

    private function getPhpMaxUploadKB(): int
    {
        $parseSize = function ($val) {
            $val = trim((string) $val);
            if (empty($val)) return 0;
            $unit = strtolower(substr($val, -1));
            $num = (int) $val;
            switch ($unit) {
                case 'g': $num *= 1024 * 1024 * 1024; break;
                case 'm': $num *= 1024 * 1024; break;
                case 'k': $num *= 1024; break;
            }
            return (int) ($num / 1024);
        };

        $uploadMax = $parseSize(ini_get('upload_max_filesize'));
        $postMax = $parseSize(ini_get('post_max_size'));
        $limits = array_filter([$uploadMax, $postMax], fn($v) => $v > 0);

        return !empty($limits) ? min($limits) : 10240;
    }

    private function validateFileUpload(Request $request, string $field, int $maxKB = 4096): void
    {
        $file = $request->file($field);
        $fileError = null;

        if ($file && ! $file->isValid()) {
            $fileError = $file->getError();
        } elseif (isset($_FILES[$field]) && is_array($_FILES[$field]) && ($_FILES[$field]['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            $fileError = $_FILES[$field]['error'];
        }

        if ($fileError !== null && $fileError !== UPLOAD_ERR_OK) {
            $phpMaxKB = $this->getPhpMaxUploadKB();
            $effectiveKB = min($maxKB, $phpMaxKB);
            $maxMB = round($effectiveKB / 1024, 1);

            if ($fileError === UPLOAD_ERR_INI_SIZE || $fileError === UPLOAD_ERR_FORM_SIZE) {
                if ($phpMaxKB < $maxKB) {
                    $phpMaxMB = round($phpMaxKB / 1024, 1);
                    $message = "The uploaded {$field} exceeds the server's PHP upload limit ({$phpMaxMB}MB). Please select a smaller file or increase upload_max_filesize in php.ini.";
                } else {
                    $message = "The uploaded {$field} exceeds the maximum allowed file size ({$maxMB}MB). Please select a smaller file.";
                }
            } else {
                $message = match ($fileError) {
                    UPLOAD_ERR_PARTIAL => "The {$field} was only partially uploaded. Please try again.",
                    UPLOAD_ERR_NO_TMP_DIR => "Server configuration error: missing temporary upload folder.",
                    UPLOAD_ERR_CANT_WRITE => "Server error: failed to write {$field} to disk.",
                    default => "The {$field} failed to upload. Please ensure the file size is under {$maxMB}MB and try again.",
                };
            }

            throw ValidationException::withMessages([
                $field => [$message],
            ]);
        }
    }

    private function normalizeCoordinateFields(array &$payload): void
    {
        foreach (['latitude', 'longitude'] as $field) {
            if (! array_key_exists($field, $payload)) {
                continue;
            }

            $value = $payload[$field];
            $payload[$field] = ($value === null || $value === '') ? null : round((float) $value, 6);
        }
    }
}
