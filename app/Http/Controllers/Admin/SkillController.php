<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Services\AuditLogService;
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

        $skill = Skill::create([
            'name'     => $validated['name'],
            'category' => $validated['category'],
            'demand'   => $validated['demand'],
            'status'   => true,
        ]);

        AuditLogService::log(
            'skill_created',
            "Admin created new skill tag '{$skill->name}' ({$skill->category}, demand: {$skill->demand}).",
            ['name' => $skill->name, 'category' => $skill->category, 'demand' => $skill->demand],
            'skills',
            $skill
        );

        return redirect()->back()->with('success', 'Skill added successfully.');
    }

    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255|unique:skills,name,' . $skill->id,
            'category' => 'required|string|max:255',
            'demand'   => 'required|in:high,medium,low',
        ]);

        $oldName = $skill->name;
        $skill->update($validated);

        AuditLogService::log(
            'skill_updated',
            "Admin updated skill tag '{$oldName}' to '{$skill->name}' ({$skill->category}).",
            ['old_name' => $oldName, 'new_name' => $skill->name, 'category' => $skill->category, 'demand' => $skill->demand],
            'skills',
            $skill
        );

        return redirect()->back()->with('success', 'Skill updated successfully.');
    }

    public function toggleStatus(Skill $skill)
    {
        $newStatus = !$skill->status;
        $skill->update([
            'status' => $newStatus,
        ]);

        AuditLogService::log(
            'skill_status_updated',
            "Admin changed skill '{$skill->name}' status to " . ($newStatus ? 'active' : 'inactive') . ".",
            ['status' => $newStatus],
            'skills',
            $skill
        );

        return redirect()->back()->with('success', 'Skill status updated.');
    }

    public function destroy(Skill $skill)
    {
        $skillName = $skill->name;
        $skill->delete();

        AuditLogService::log(
            'skill_deleted',
            "Admin removed skill tag '{$skillName}'.",
            ['name' => $skillName],
            'skills'
        );

        return redirect()->back()->with('success', 'Skill removed successfully.');
    }
}