<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    public function index(Request $request): Response
    {
        $skills = Skill::latest()->get()->map(function ($s) {
            return [
                'id'       => $s->id,
                'uuid'     => $s->uuid,
                'name'     => $s->name,
                'category' => $s->category,
                'demand'   => $s->demand,
                'active'   => (bool) $s->status,
            ];
        });

        return Inertia::render('Admin/Skills', [
            'skills' => $skills,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255|unique:skills,name',
            'category' => 'required|string|max:255',
            'demand'   => 'required|in:high,medium,low',
        ]);

        Skill::create([
            'name'     => $validated['name'],
            'category' => $validated['category'],
            'demand'   => $validated['demand'],
            'status'   => true,
        ]);

        return redirect()->back()->with('success', 'Skill added successfully.');
    }

    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255|unique:skills,name,' . $skill->id,
            'category' => 'required|string|max:255',
            'demand'   => 'required|in:high,medium,low',
        ]);

        $skill->update($validated);

        return redirect()->back()->with('success', 'Skill updated successfully.');
    }

    public function toggleStatus(Skill $skill)
    {
        $skill->update([
            'status' => !$skill->status,
        ]);

        return redirect()->back()->with('success', 'Skill status updated.');
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();

        return redirect()->back()->with('success', 'Skill removed successfully.');
    }
}