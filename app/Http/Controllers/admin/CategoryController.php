<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
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
        
        $subCategory->delete();

        return back()->with('success', 'Subcategory deleted successfully.');
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