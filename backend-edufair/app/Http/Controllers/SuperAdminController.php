<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\University;
use App\Models\StudentVisit;
use App\Models\LuckyDrawParticipant;
use App\Models\Winner;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminController extends Controller
{
    public function getStats()
    {
        $totalStudents = User::where('role', 'student')->count();
        $totalUnis = University::count();
        
        // Completed students are students who have visited all universities
        $completedStudents = 0;
        if ($totalUnis > 0) {
            $completedStudents = User::where('role', 'student')
                ->has('visits', '=', $totalUnis)
                ->count();
        }

        $remainingStudents = $totalStudents - $completedStudents;
        $luckyDrawParticipantsCount = LuckyDrawParticipant::count();

        // Daily check-in activity charts data (last 7 days)
        $dailyCheckins = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = StudentVisit::whereDate('visited_at', $date)->count();
            $dailyCheckins[] = [
                'date' => now()->subDays($i)->format('D, M d'),
                'count' => $count
            ];
        }

        // Daily registration stats
        $dailyRegistrations = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = User::where('role', 'student')->whereDate('created_at', $date)->count();
            $dailyRegistrations[] = [
                'date' => now()->subDays($i)->format('D, M d'),
                'count' => $count
            ];
        }

        return response()->json([
            'total_students' => $totalStudents,
            'total_universities' => $totalUnis,
            'completed_students' => $completedStudents,
            'remaining_students' => $remainingStudents,
            'lucky_draw_participants' => $luckyDrawParticipantsCount,
            'analytics' => [
                'daily_checkins' => $dailyCheckins,
                'daily_registrations' => $dailyRegistrations,
            ]
        ], Response::HTTP_OK);
    }

    public function listUniversities()
    {
        $universities = University::all();

        return response()->json($universities, Response::HTTP_OK);
    }

    public function storeUniversity(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url',
            'location' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'admin_id' => 'nullable|exists:users,id',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        $university = University::create([
            'name' => $request->name,
            'description' => $request->description,
            'website' => $request->website,
            'location' => $request->location,
            'logo' => $logoPath,
            'admin_id' => $request->admin_id,
        ]);

        return response()->json([
            'message' => 'University booth created successfully.',
            'university' => $university,
        ], Response::HTTP_CREATED);
    }

    public function updateUniversity(Request $request, $id)
    {
        $university = University::find($id);

        if (!$university) {
            return response()->json(['message' => 'University not found.'], Response::HTTP_NOT_FOUND);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url',
            'location' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'admin_id' => 'nullable|exists:users,id',
        ]);

        $logoPath = $university->logo;
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($university->logo && Storage::disk('public')->exists($university->logo)) {
                Storage::disk('public')->delete($university->logo);
            }
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        $university->update([
            'name' => $request->name,
            'description' => $request->description,
            'website' => $request->website,
            'location' => $request->location,
            'logo' => $logoPath,
            'admin_id' => $request->admin_id,
        ]);

        return response()->json([
            'message' => 'University updated successfully.',
            'university' => $university,
        ], Response::HTTP_OK);
    }

    public function destroyUniversity($id)
    {
        $university = University::find($id);

        if (!$university) {
            return response()->json(['message' => 'University not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($university->logo && Storage::disk('public')->exists($university->logo)) {
            Storage::disk('public')->delete($university->logo);
        }

        $university->delete();

        return response()->json([
            'message' => 'University deleted successfully.',
        ], Response::HTTP_OK);
    }

    public function listUniversityAdmins()
    {
        $admins = User::where('role', 'university_admin')->get();
        return response()->json($admins, Response::HTTP_OK);
    }

    public function storeUniversityAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:users,name|max:255',
            'password' => 'required|string|min:6',
        ]);

        $admin = User::create([
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'role' => 'university_admin',
        ]);

        return response()->json([
            'message' => 'University Admin created successfully.',
            'admin' => $admin,
        ], Response::HTTP_CREATED);
    }

    public function updateUniversityAdmin(Request $request, $id)
    {
        $admin = User::where('role', 'university_admin')->find($id);
        if (!$admin) {
            return response()->json(['message' => 'Admin not found.'], Response::HTTP_NOT_FOUND);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:users,name,' . $admin->id,
            'password' => 'nullable|string|min:6',
        ]);

        $admin->name = $request->name;
        if ($request->password) {
            $admin->password = Hash::make($request->password);
        }
        $admin->save();

        return response()->json([
            'message' => 'University Admin updated successfully.',
            'admin' => $admin,
        ], Response::HTTP_OK);
    }

    public function destroyUniversityAdmin($id)
    {
        $admin = User::where('role', 'university_admin')->find($id);
        if (!$admin) {
            return response()->json(['message' => 'Admin not found.'], Response::HTTP_NOT_FOUND);
        }
        
        // Remove assignment from universities
        University::where('admin_id', $admin->id)->update(['admin_id' => null]);
        
        $admin->delete();

        return response()->json([
            'message' => 'University Admin deleted successfully.',
        ], Response::HTTP_OK);
    }

    public function listStudents(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status'); // 'completed' or 'pending'

        $totalUnis = University::count();

        $query = User::where('role', 'student');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $students = $query->withCount('visits')->get();

        $studentData = $students->map(function ($student) use ($totalUnis) {
            $percentage = $totalUnis > 0 ? round(($student->visits_count / $totalUnis) * 100) : 0;
            return [
                'id' => $student->id,
                'name' => $student->name,
                'visited_count' => $student->visits_count,
                'total_universities' => $totalUnis,
                'percentage' => $percentage,
                'created_at' => $student->created_at,
                'lucky_draw_joined' => LuckyDrawParticipant::where('student_id', $student->id)->exists(),
            ];
        });

        if ($status === 'completed') {
            $studentData = $studentData->filter(fn($s) => $s['visited_count'] === $totalUnis)->values();
        } elseif ($status === 'pending') {
            $studentData = $studentData->filter(fn($s) => $s['visited_count'] < $totalUnis)->values();
        }

        return response()->json($studentData, Response::HTTP_OK);
    }

    public function getStudentProgress($id)
    {
        $student = User::where('role', 'student')->find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found.'], Response::HTTP_NOT_FOUND);
        }

        $totalUnis = University::count();
        $visits = StudentVisit::where('student_id', $student->id)->get()->keyBy('university_id');

        $universities = University::all()->map(function ($uni) use ($visits) {
            $visited = isset($visits[$uni->id]);
            return [
                'id' => $uni->id,
                'name' => $uni->name,
                'location' => $uni->location,
                'visited' => $visited,
                'visited_at' => $visited ? $visits[$uni->id]->visited_at->toIso8601String() : null,
            ];
        });

        $visitedCount = $visits->count();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
            ],
            'progress' => [
                'visited_count' => $visitedCount,
                'total_count' => $totalUnis,
                'percentage' => $totalUnis > 0 ? round(($visitedCount / $totalUnis) * 100) : 0,
            ],
            'stamp_history' => $universities,
        ], Response::HTTP_OK);
    }

    public function listParticipants()
    {
        $participants = LuckyDrawParticipant::with('student')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'student_id' => $p->student_id,
                'student_name' => $p->student ? $p->student->name : 'Unknown Student',
                'participant_number' => $p->participant_number,
                'joined_at' => $p->joined_at,
            ];
        });

        return response()->json($participants, Response::HTTP_OK);
    }

    public function spinLuckyDraw(Request $request)
    {
        $request->validate([
            'prize' => 'nullable|string|max:255',
        ]);

        $wonStudentIds = Winner::pluck('student_id')->toArray();
        
        $eligibleQuery = LuckyDrawParticipant::whereNotIn('student_id', $wonStudentIds);
        
        if ($eligibleQuery->count() === 0) {
            return response()->json([
                'message' => 'No eligible participants found. Either all participants have won, or no one has registered for the lucky draw.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $winnerParticipant = $eligibleQuery->inRandomOrder()->first();
        $student = $winnerParticipant->student;

        $prize = $request->prize ?? 'Door Prize';
        $winner = Winner::create([
            'student_id' => $student->id,
            'prize' => $prize,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Winner selected successfully!',
            'winner' => [
                'id' => $winner->id,
                'student_name' => $student->name,
                'participant_number' => $winnerParticipant->participant_number,
                'prize' => $prize,
                'drawn_at' => $winner->created_at,
            ]
        ], Response::HTTP_OK);
    }

    public function getWinners()
    {
        $winners = Winner::with('student.luckyDrawParticipant')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($w) {
                return [
                    'id' => $w->id,
                    'student_name' => $w->student ? $w->student->name : 'Unknown Student',
                    'participant_number' => $w->student && $w->student->luckyDrawParticipant 
                        ? $w->student->luckyDrawParticipant->participant_number 
                        : 'N/A',
                    'prize' => $w->prize,
                    'drawn_at' => $w->created_at,
                ];
            });

        return response()->json($winners, Response::HTTP_OK);
    }

    public function destroyWinner($id)
    {
        $winner = Winner::find($id);

        if (!$winner) {
            return response()->json(['message' => 'Winner not found.'], Response::HTTP_NOT_FOUND);
        }

        $winner->delete();

        return response()->json([
            'message' => 'Winner deleted/undone successfully.',
        ], Response::HTTP_OK);
    }

    public function getLeaderboard()
    {
        $leaderboard = \App\Models\University::withCount('points')
            ->withAvg('points', 'score')
            ->orderBy('points_avg_score', 'desc')
            ->orderBy('points_count', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($leaderboard, Response::HTTP_OK);
    }

    public function listAnnouncements()
    {
        $announcements = Announcement::orderBy('created_at', 'desc')->get();
        return response()->json($announcements, Response::HTTP_OK);
    }

    public function storeAnnouncement(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'title' => 'nullable|string|max:255',
            'type' => 'required|in:info,urgent,event',
            'is_active' => 'nullable|boolean',
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type ?? 'info',
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Pengumuman berhasil dibuat!',
            'data' => $announcement
        ], Response::HTTP_CREATED);
    }

    public function toggleAnnouncement($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->is_active = !$announcement->is_active;
        $announcement->save();

        return response()->json([
            'message' => 'Status pengumuman diperbarui!',
            'data' => $announcement
        ], Response::HTTP_OK);
    }

    public function destroyAnnouncement($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'message' => 'Pengumuman dihapus!'
        ], Response::HTTP_OK);
    }
}
