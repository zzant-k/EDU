<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\University;
use App\Models\StudentVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class UniversityAdminController extends Controller
{
    public function getDashboard(Request $request)
    {
        $admin = $request->user();
        $university = $admin->university;

        if (!$university) {
            return response()->json(['message' => 'No university assigned to this admin.'], Response::HTTP_NOT_FOUND);
        }

        $totalScans = StudentVisit::where('university_id', $university->id)->count();
        $todayScans = StudentVisit::where('university_id', $university->id)->whereDate('visited_at', now()->toDateString())->count();
        
        $recentVisitors = StudentVisit::with('student')
            ->where('university_id', $university->id)
            ->orderBy('visited_at', 'desc')
            ->limit(5)
            ->get()->map(function($visit) {
                return [
                    'student_name' => $visit->student->name,
                    'visited_at' => $visit->visited_at,
                ];
            });

        return response()->json([
            'university_name' => $university->name,
            'total_scans' => $totalScans,
            'today_scans' => $todayScans,
            'recent_visitors' => $recentVisitors
        ], Response::HTTP_OK);
    }

    public function getBooth(Request $request)
    {
        $admin = $request->user();
        $university = $admin->university;

        if (!$university) {
            return response()->json(['message' => 'No university assigned.'], Response::HTTP_NOT_FOUND);
        }

        // Fallback to frontend URL generation

        return response()->json($university, Response::HTTP_OK);
    }

    public function updateBooth(Request $request)
    {
        $admin = $request->user();
        $university = $admin->university;

        if (!$university) {
            return response()->json(['message' => 'No university assigned.'], Response::HTTP_NOT_FOUND);
        }

        $request->validate([
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $logoPath = $university->logo;
        if ($request->hasFile('logo')) {
            if ($university->logo && Storage::disk('public')->exists($university->logo)) {
                Storage::disk('public')->delete($university->logo);
            }
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        $university->update([
            'description' => $request->description,
            'logo' => $logoPath,
        ]);

        return response()->json([
            'message' => 'Booth profile updated successfully.',
            'university' => $university,
        ], Response::HTTP_OK);
    }

    public function getVisitors(Request $request)
    {
        $admin = $request->user();
        $university = $admin->university;

        if (!$university) {
            return response()->json(['message' => 'No university assigned.'], Response::HTTP_NOT_FOUND);
        }

        $visitors = StudentVisit::with('student')
            ->where('university_id', $university->id)
            ->orderBy('visited_at', 'desc')
            ->get()->map(function($visit) {
                return [
                    'student_name' => $visit->student->name,
                    'visited_at' => $visit->visited_at,
                ];
            });

        return response()->json($visitors, Response::HTTP_OK);
    }

    public function getLeaderboard()
    {
        $leaderboard = University::withCount('points')
            ->withAvg('points', 'score')
            ->orderBy('points_avg_score', 'desc')
            ->orderBy('points_count', 'desc')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'logo']);

        return response()->json($leaderboard, Response::HTTP_OK);
    }
}
