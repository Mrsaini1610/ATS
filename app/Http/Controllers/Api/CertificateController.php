<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class CertificateController extends Controller
{
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
     * Delete candidate certificate
     */
    public function deleteCertificate(Request $request, $id)
    {
        $user = $request->user();
        $certificate = $user->certificates()->where('id', $id)->first();

        if (!$certificate) {
            return response()->json([
                'status'  => false,
                'message' => 'Certificate not found or unauthorized.'
            ], 404);
        }

        $certificate->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Certificate deleted successfully.'
        ], 200);
    }
}
