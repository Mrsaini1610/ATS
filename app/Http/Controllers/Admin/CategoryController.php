<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
     public function index(Request $request): Response
    {
        $categories = Category::with(['subcategories' => function ($query) {
                $query->withCount('jobPosts');
            }])
            ->withCount(['jobPosts', 'subcategories'])
            ->orderBy('id', 'asc') // Sequence ko proper rakhne ke liye
            ->get()
            ->map(function ($cat) {
                return [
                    'id'            => $cat->id,
                    'uuid'          => $cat->uuid ?? (string) $cat->id,
                    'name'          => $cat->name,
                    'slug'          => $cat->slug,
                    'icon'          => $cat->icon ?? '📁',
                    'status'        => $cat->status ?? 'active',
                    'job_count'     => $cat->job_posts_count ?? 0,
                    'subcategories' => $cat->subcategories->map(function ($sub) {
                        return [
                            'uuid'      => $sub->uuid ?? (string) $sub->id,
                            'name'      => $sub->name,
                            'status'    => $sub->status ?? 'active',
                            'job_count' => $sub->job_posts_count ?? 0,
                        ];
                    }),
                    'created_at'    => $cat->created_at ? $cat->created_at->format('d M Y') : null,
                ];
            });

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255|unique:categories,name',
            'icon'   => 'nullable|string|max:50',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $category = Category::create([
            'uuid'   => (string) \Illuminate\Support\Str::uuid(),
            'name'   => $validated['name'],
            'slug'   => Str::slug($validated['name']),
            'icon'   => $validated['icon'] ?? '📁',
            'status' => $validated['status'] ?? 'active',
        ]);

        AuditLogService::log(
            'category_created',
            "Admin created new industry category '{$category->name}'.",
            ['name' => $category->name, 'icon' => $category->icon, 'status' => $category->status],
            'categories',
            $category
        );

        return redirect()->back()->with('success', 'Category successfully add ho gayi.');
    }

    public function storeSubcategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $sub = $category->subcategories()->create([
            'name'   => $validated['name'],
            'slug'   => \Illuminate\Support\Str::slug($validated['name']),
            'status' => 'active',
        ]);

        AuditLogService::log(
            'subcategory_created',
            "Admin added subcategory '{$sub->name}' under category '{$category->name}'.",
            ['category' => $category->name, 'subcategory' => $sub->name],
            'categories',
            $category
        );

        return back()->with('success', 'Subcategory successfully added.');
    }

    public function destroySubcategory($categoryUuid, $subUuid)
    {
        $category = \App\Models\Category::where('uuid', $categoryUuid)->firstOrFail();
        $subCategory = $category->subcategories()->where('uuid', $subUuid)->firstOrFail();
        $subName = $subCategory->name;
        
        $subCategory->delete();

        AuditLogService::log(
            'subcategory_deleted',
            "Admin deleted subcategory '{$subName}' from category '{$category->name}'.",
            ['category' => $category->name, 'subcategory' => $subName],
            'categories',
            $category
        );

        return back()->with('success', 'Subcategory deleted successfully.');
    }

    public function updateSubcategory(Request $request, $categoryUuid, $subUuid)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::where('uuid', $categoryUuid)->firstOrFail();
        $subcategory = $category->subcategories()->where('uuid', $subUuid)->firstOrFail();
        $oldName = $subcategory->name;
        $subcategory->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        AuditLogService::log(
            'subcategory_updated',
            "Admin updated subcategory '{$oldName}' to '{$validated['name']}' in category '{$category->name}'.",
            ['category' => $category->name, 'old_name' => $oldName, 'new_name' => $validated['name']],
            'categories',
            $category
        );

        return back()->with('success', 'Subcategory updated successfully.');
    }

    public function toggleStatusSubcategory($categoryUuid, $subUuid)
    {
        $category = Category::where('uuid', $categoryUuid)->firstOrFail();
        $subcategory = $category->subcategories()->where('uuid', $subUuid)->firstOrFail();
        $newStatus = ($subcategory->status === 'active') ? 'inactive' : 'active';
        $subcategory->update([
            'status' => $newStatus,
        ]);

        AuditLogService::log(
            'subcategory_status_updated',
            "Admin changed subcategory '{$subcategory->name}' status to {$newStatus}.",
            ['category' => $category->name, 'subcategory' => $subcategory->name, 'status' => $newStatus],
            'categories',
            $category
        );

        return back()->with('success', 'Subcategory status successfully updated.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'icon'   => 'nullable|string|max:50',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $oldName = $category->name;
        $category->update([
            'name'   => $validated['name'],
            'slug'   => Str::slug($validated['name']),
            'icon'   => $validated['icon'] ?? $category->icon,
            'status' => $validated['status'] ?? $category->status,
        ]);

        AuditLogService::log(
            'category_updated',
            "Admin updated category '{$oldName}' to '{$category->name}'.",
            ['old_name' => $oldName, 'new_name' => $category->name, 'status' => $category->status],
            'categories',
            $category
        );

        return redirect()->back()->with('success', 'Category successfully update ho gayi.');
    }

    public function toggleStatus(Category $category)
    {
        $newStatus = ($category->status === 'active') ? 'inactive' : 'active';
        $category->update([
            'status' => $newStatus,
        ]);

        AuditLogService::log(
            'category_status_updated',
            "Admin changed category '{$category->name}' status to {$newStatus}.",
            ['status' => $newStatus],
            'categories',
            $category
        );

        return redirect()->back()->with('success', 'Category status change ho gaya.');
    }

    public function destroy(Category $category)
    {
        $catName = $category->name;
        $category->delete();

        AuditLogService::log(
            'category_deleted',
            "Admin deleted category '{$catName}'.",
            ['category' => $catName],
            'categories'
        );

        return redirect()->back()->with('success', 'Category delete ho gayi.');
    }
}