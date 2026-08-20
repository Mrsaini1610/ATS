<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Get all categories with optional search
     *
     * Request Body: { "search": "software", "status": "active" } (optional)
     */
    public function getCategories(Request $request)
    {
        try {
            $query = Category::query();

            // Status filter (Default active agar filter nahi bheja)
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            } else {
                $query->where('status', 'active');
            }

            // Search by Name or Slug
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('slug', 'LIKE', "%{$searchTerm}%");
                });
            }

            $categories = $query->latest()->get();

            return response()->json([
                'status' => true,
                'message' => 'Categories fetched successfully.',
                'data' => $categories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single category by UUID
     *
     * Request Body: { "uuid": "2603c6f8-9a2a-11f1-a231-d6c6f219e5d9" }
     */
    public function getCategoryByUuid(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'uuid' => 'required|string|exists:categories,uuid',
        ], [
            'uuid.required' => 'Category UUID is required.',
            'uuid.exists' => 'Category not found.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $category = Category::where('uuid', $request->uuid)->first();

            return response()->json([
                'status' => true,
                'message' => 'Category details fetched successfully.',
                'data' => $category
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch category detail: ' . $e->getMessage()
            ], 500);
        }
    }
}
