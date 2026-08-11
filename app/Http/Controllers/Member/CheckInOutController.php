<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\CheckInOut;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckInOutController extends Controller
{
    public function checkIn(Request $request)
    {
        if (Auth::guard('member')->check()) {
            $member = Auth::guard('member')->user();
            $role = 'member';
        } elseif (Auth::guard('admin')->check()) {
            $member = Auth::guard('admin')->user();
            $role = 'admin';
        } else {
            return redirect()->back()->with('error', 'Unauthorized access.');
        }

        $today = Carbon::today()->toDateString();

        $existingCheck = CheckInOut::where('member_id', $member->id)
            ->whereDate('date', $today)
            ->first();

        if ($existingCheck) {
            if ($existingCheck->check_out) {
                return redirect()->back()->with('error', 'You have already checked out today.');
            }

            return redirect()->back()->with('error', 'You are already checked in.');
        }

        CheckInOut::create([
            'member_id' => $member->id,
            'date' => $today,
            'check_in' => Carbon::now(),
            'check_in_ip' => $request->ip(),
            'check_in_notes' => $request->notes,
            'role' => $role,
        ]);

        return redirect()->back()->with('success', ucfirst($role).' checked in successfully.');
    }

    public function checkOut(Request $request)
    {
        if (Auth::guard('member')->check()) {
            $member = Auth::guard('member')->user();
            $role = 'member';
        } elseif (Auth::guard('admin')->check()) {
            $member = Auth::guard('admin')->user();
            $role = 'admin';
        } else {
            return redirect()->back()->with('error', 'Unauthorized access.');
        }

        $today = Carbon::today()->toDateString();

        $checkIn = CheckInOut::where('member_id', $member->id)
            ->whereDate('date', $today)
            ->first();

        if (! $checkIn) {
            return redirect()->back()->with('error', 'You need to check in first.');
        }

        if ($checkIn->check_out) {
            return redirect()->back()->with('error', 'You have already checked out today.');
        }

        $checkOutTime = Carbon::now();
        $checkInTime = Carbon::parse($checkIn->check_in);
        $totalMinutes = $checkInTime->diffInMinutes($checkOutTime);

        $checkIn->update([
            'check_out' => $checkOutTime,
            'check_out_ip' => $request->ip(),
            'check_out_notes' => $request->notes,
            'total_minutes' => $totalMinutes,
            'role' => $role,
        ]);

        return redirect()->back()->with('success', ucfirst($role).' checked out successfully.');
    }

    public function getCheckInStatus(Request $request)
    {
        $member = Auth::guard('member')->user();
        $today = Carbon::today()->toDateString();
        $checkIn = CheckInOut::where('member_id', $member->id)
            ->whereDate('date', $today)
            ->first();

        $status = [
            'checked_in' => false,
            'checked_out' => false,
            'check_in_time' => null,
            'elapsed_time' => 0,
            'elapsed_time_formatted' => '00:00:00',
        ];

        if ($checkIn) {
            $status['checked_in'] = true;
            $status['check_in_time'] = $checkIn->check_in;

            if ($checkIn->check_out) {
                $status['checked_out'] = true;
                $status['elapsed_time'] = $checkIn->total_minutes * 60;
                $status['elapsed_time_formatted'] = $this->formatMinutesToTime($checkIn->total_minutes);
            } else {
                $elapsedSeconds = Carbon::now()->diffInSeconds($checkIn->check_in);
                $status['elapsed_time'] = $elapsedSeconds;
                $status['elapsed_time_formatted'] = $this->formatSecondsToTime($elapsedSeconds);
            }
        }

        return redirect()->back()->with('success', 'Checked in successfully');
    }

    private function formatMinutesToTime($minutes)
    {
        $hours = floor($minutes / 60);
        $minutes = $minutes % 60;
        $seconds = 0;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }

    private function formatSecondsToTime($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }

    public function checkInOutUpdate($id, Request $request)
    {
        $checkInOut = CheckInOut::findOrFail($id);

        $request->validate([
            'check_in' => 'nullable|date',
            'check_out' => 'nullable|sometimes|date',
        ]);
        $checkIn = $request->has('check_in') ? $request->check_in : $checkInOut->check_in;
        $checkOut = $request->has('check_out') ? $request->check_out : $checkInOut->check_out;
        if ($checkIn && $checkOut && Carbon::parse($checkOut)->lte(Carbon::parse($checkIn))) {
            return back()->with('error', 'Check-out time must be after check-in time');
        }
        if ($request->has('check_in')) {
            $checkInOut->check_in = $request->check_in;
        }
        if ($request->has('check_out')) {
            $checkInOut->check_out = $request->check_out;
        }
        if ($checkInOut->check_in && $checkInOut->check_out) {
            $checkInOut->total_minutes = Carbon::parse($checkInOut->check_in)
                ->diffInMinutes(Carbon::parse($checkInOut->check_out));
        } else {
            $checkInOut->total_minutes = null;
        }
        $checkInOut->save();

        return back()->with('success', 'Check-in/out times updated successfully');
    }
}
