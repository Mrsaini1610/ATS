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
        // Safe fetch without relation dependency
        $categories = Category::latest()
            ->get()
            ->map(function ($cat) {
                return [
                    'id'         => $cat->id,
                    'uuid'       => $cat->uuid ?? (string) $cat->id,
                    'name'       => $cat->name,
                    'slug'       => $cat->slug,
                    'status'     => $cat->status ?? 'active',
                    'jobCount'   => 0,
                    'created_at' => $cat->created_at ? $cat->created_at->format('d M Y') : null,
                ];
            });

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $slug = Str::slug($validated['name']);
        $count = Category::where('slug', 'like', "{$slug}%")->count();
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }

        Category::create([
            'uuid'   => (string) Str::uuid(),
            'name'   => $validated['name'],
            'slug'   => $slug,
            'status' => $validated['status'] ?? 'active',
        ]);

        return redirect()->back()->with('success', 'Category successfully add ho gayi.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $category->update([
            'name'   => $validated['name'],
            'slug'   => Str::slug($validated['name']),
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
