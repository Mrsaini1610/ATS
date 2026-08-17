<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class CertificateController extends Controller
{
    /**
     * Get candidate certificates (Only active records: is_delete = 0)
     */
    public function getCertificates(Request $request)
    {
        try {
            $user = $request->user();

            // Sirf non-deleted certificates fetch honge
            $certificates = $user->certificates()
                ->where('is_delete', 0)
                ->latest('issue_date')
                ->get();

            return response()->json([
                'status'  => true,
                'message' => 'Certificates fetched successfully',
                'data'    => $certificates
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add candidate certificate
     */
    public function addCertificate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'                => 'required|string|max:255',
            'issuing_organization'=> 'nullable|string|max:255',
            'issue_date'           => 'nullable|date_format:Y-m-d',
            'expiration_date'      => 'nullable|date_format:Y-m-d|after_or_equal:issue_date',
            'credential_id'        => 'nullable|string|max:255',
            'credential_url'       => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $certificate = $request->user()->certificates()->create([
                'title'                => $request->title,
                'issuing_organization'=> $request->issuing_organization,
                'issue_date'           => $request->issue_date,
                'expiration_date'      => $request->expiration_date,
                'credential_id'        => $request->credential_id,
                'credential_url'       => $request->credential_url,
                'is_delete'            => 0,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Certificate added successfully',
                'data'    => $certificate
            ], 201);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update candidate certificate
     */
    public function updateCertificate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title'                => 'sometimes|required|string|max:255',
            'issuing_organization'=> 'nullable|string|max:255',
            'issue_date'           => 'nullable|date_format:Y-m-d',
            'expiration_date'      => 'nullable|date_format:Y-m-d|after_or_equal:issue_date',
            'credential_id'        => 'nullable|string|max:255',
            'credential_url'       => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $certificate = $user->certificates()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$certificate) {
            return response()->json([
                'status'  => false,
                'message' => 'Certificate not found or unauthorized.'
            ], 404);
        }

        try {
            $certificate->update($request->only([
                'title',
                'issuing_organization',
                'issue_date',
                'expiration_date',
                'credential_id',
                'credential_url'
            ]));

            return response()->json([
                'status'  => true,
                'message' => 'Certificate updated successfully',
                'data'    => $certificate
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete candidate certificate (Soft Delete)
     */
    public function deleteCertificate(Request $request, $id)
    {
        $user = $request->user();

        $certificate = $user->certificates()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$certificate) {
            return response()->json([
                'status'  => false,
                'message' => 'Certificate not found or already deleted.'
            ], 404);
        }

        // Soft delete: is_delete set to 1
        $certificate->is_delete = 1;
        $certificate->save();

        return response()->json([
            'status'  => true,
            'message' => 'Certificate deleted successfully.'
        ], 200);
    }
}
