<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
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

        Category::create([
            'uuid'   => (string) \Illuminate\Support\Str::uuid(),
            'name'   => $validated['name'],
            'slug'   => Str::slug($validated['name']),
            'icon'   => $validated['icon'] ?? '📁',
            'status' => $validated['status'] ?? 'active',
        ]);

        return redirect()->back()->with('success', 'Category successfully add ho gayi.');
    }

public function storeSubcategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category->subcategories()->create([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'status' => 'active',
        ]);

        return back()->with('success', 'Subcategory successfully added.');
    }

    public function destroySubcategory($categoryUuid, $subUuid)
    {
        // Agar categories/subcategories uuid se find karni hain:
        $category = \App\Models\Category::where('uuid', $categoryUuid)->firstOrFail();
        $subCategory = $category->subcategories()->where('uuid', $subUuid)->firstOrFail();
        
        /** @var Subcategory $subCategory */
        $subCategory->delete();

        return back()->with('success', 'Subcategory deleted successfully.');
    }

    public function updateSubcategory(Request $request, $categoryUuid, $subUuid)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::where('uuid', $categoryUuid)->firstOrFail();
        /** @var Subcategory $subcategory */
        $subcategory = $category->subcategories()->where('uuid', $subUuid)->firstOrFail();
        $subcategory->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with('success', 'Subcategory updated successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'icon'   => 'nullable|string|max:50',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $category->update([
            'name'   => $validated['name'],
            'slug'   => Str::slug($validated['name']),
            'icon'   => $validated['icon'] ?? $category->icon,
            'status' => $validated['status'] ?? $category->status,
        ]);

        return redirect()->back()->with('success', 'Category successfully update ho gayi.');
    }

    public function toggleStatus(Category $category)
    {
        $category->update([
            'status' => ($category->status === 'active') ? 'inactive' : 'active',
        ]);

        return redirect()->back()->with('success', 'Category status change ho gaya.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'Category delete ho gayi.');
    }
}