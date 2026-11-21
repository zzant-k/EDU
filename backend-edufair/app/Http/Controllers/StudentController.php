<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\StudentVisit;
use App\Models\LuckyDrawParticipant;
use App\Models\UniversityPoint;
use App\Models\Announcement;
use App\Models\Winner;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class StudentController extends Controller
{
    public function getDashboard(Request $request)
    {
        $student = $request->user();
        
        $totalUnis = University::count();
        $visitedUniIds = StudentVisit::where('student_id', $student->id)
            ->pluck('university_id')
            ->toArray();
        $visitedCount = count($visitedUniIds);
        
        $percentage = $totalUnis > 0 ? round(($visitedCount / $totalUnis) * 100) : 0;
        $remainingCount = $totalUnis - $visitedCount;

        $universities = University::all()->map(function ($uni) use ($visitedUniIds) {
            $uni->visited = in_array($uni->id, $visitedUniIds);
            return $uni;
        });

        $participant = LuckyDrawParticipant::where('student_id', $student->id)->first();
        $lastVisit = StudentVisit::where('student_id', $student->id)->latest('visited_at')->first();

        return response()->json([
            'student_name' => $student->name,
            'total_universities' => $totalUnis,
            'visited_count' => $visitedCount,
            'remaining_count' => $remainingCount,
            'percentage' => $percentage,
            'universities' => $universities,
            'lucky_draw' => $participant ? [
                'joined' => true,
                'participant_number' => $participant->participant_number,
                'joined_at' => $participant->joined_at,
            ] : [
                'joined' => false,
            ],
            'last_visited' => $lastVisit ? Carbon::parse($lastVisit->visited_at)->diffForHumans() : null,
        ], Response::HTTP_OK);
    }

    public function getUniversityDetail(Request $request, $id)
    {
        $student = $request->user();
        $university = University::find($id);

        if (!$university) {
            return response()->json(['message' => 'University not found.'], Response::HTTP_NOT_FOUND);
        }

        $visited = StudentVisit::where('student_id', $student->id)
            ->where('university_id', $id)
            ->exists();

        $university->visited = $visited;

        return response()->json($university, Response::HTTP_OK);
    }

    public function scanQR(Request $request)
    {
        $request->validate([
            'qr_token' => 'required|string',
        ]);

        $student = $request->user();
        $university = University::where('qr_token', $request->qr_token)->first();

        if (!$university) {
            return response()->json([
                'message' => 'Invalid QR Code. This university booth does not exist.',
            ], Response::HTTP_NOT_FOUND);
        }

        $alreadyVisited = StudentVisit::where('student_id', $student->id)
            ->where('university_id', $university->id)
            ->exists();

        if ($alreadyVisited) {
            return response()->json([
                'message' => 'Stamp already collected. You have already visited ' . $university->name . '.',
                'university' => $university,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Save visit
        $visit = StudentVisit::create([
            'student_id' => $student->id,
            'university_id' => $university->id,
            'visited_at' => Carbon::now(),
        ]);

        $totalUnis = University::count();
        $visitedCount = StudentVisit::where('student_id', $student->id)->count();
        $allCompleted = $visitedCount === $totalUnis;

        return response()->json([
            'message' => 'Stamp successfully collected!',
            'university' => $university,
            'visit' => $visit,
            'progress' => [
                'visited_count' => $visitedCount,
                'total_count' => $totalUnis,
                'percentage' => $totalUnis > 0 ? round(($visitedCount / $totalUnis) * 100) : 0,
            ],
            'all_completed' => $allCompleted,
        ], Response::HTTP_OK);
    }



    public function getProfile(Request $request)
    {
        $student = $request->user();
        $totalUnis = University::count();
        $visitedCount = StudentVisit::where('student_id', $student->id)->count();

        $participant = LuckyDrawParticipant::where('student_id', $student->id)->first();

        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'role' => $student->role,
            'progress' => [
                'visited_count' => $visitedCount,
                'total_count' => $totalUnis,
                'percentage' => $totalUnis > 0 ? round(($visitedCount / $totalUnis) * 100) : 0,
            ],
            'lucky_draw' => $participant ? [
                'joined' => true,
                'participant_number' => $participant->participant_number,
                'joined_at' => $participant->joined_at,
            ] : [
                'joined' => false,
            ],
        ], Response::HTTP_OK);
    }

    public function joinLuckyDraw(Request $request)
    {
        $student = $request->user();
        
        $totalUnis = University::count();
        $visitedCount = StudentVisit::where('student_id', $student->id)->count();

        if ($visitedCount < $totalUnis || $totalUnis === 0) {
            return response()->json([
                'message' => 'Locked. You must collect all university stamps before joining the Lucky Draw.',
            ], Response::HTTP_FORBIDDEN);
        }

        $existing = LuckyDrawParticipant::where('student_id', $student->id)->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already joined the Lucky Draw.',
                'participant' => $existing,
            ], Response::HTTP_OK);
        }

        $participant = LuckyDrawParticipant::create([
            'student_id' => $student->id,
            'joined_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Congratulations! You have successfully registered for the Lucky Draw.',
            'participant' => $participant,
        ], Response::HTTP_CREATED);
    }

    public function getParticipant(Request $request)
    {
        $student = $request->user();
        $participant = LuckyDrawParticipant::where('student_id', $student->id)->first();

        return response()->json([
            'participant' => $participant,
        ], Response::HTTP_OK);
    }

    public function rateUniversity(Request $request, $id)
    {
        $request->validate([
            'score' => 'required|integer|min:1|max:5',
        ]);

        $student = $request->user();
        $university = University::find($id);

        if (!$university) {
            return response()->json(['message' => 'University not found.'], Response::HTTP_NOT_FOUND);
        }

        // Must have visited the university first
        $hasVisited = StudentVisit::where('student_id', $student->id)
            ->where('university_id', $id)
            ->exists();

        if (!$hasVisited) {
            return response()->json([
                'message' => 'You must visit (scan) this stand before you can rate it.'
            ], Response::HTTP_FORBIDDEN);
        }

        $existingPoint = UniversityPoint::where('student_id', $student->id)
            ->where('university_id', $id)
            ->first();

        if ($existingPoint) {
            $existingPoint->update(['score' => $request->score]);
            $message = 'Rating updated successfully.';
        } else {
            UniversityPoint::create([
                'student_id' => $student->id,
                'university_id' => $id,
                'score' => $request->score,
            ]);
            $message = 'Rating submitted successfully.';
        }

        return response()->json([
            'message' => $message,
            'points_avg' => round($university->points()->avg('score'), 1)
        ], Response::HTTP_OK);
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

    public function getActiveAnnouncements()
    {
        $announcements = Announcement::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($announcements, Response::HTTP_OK);
    }

    public function getWinnerStatus(Request $request)
    {
        $student = $request->user();
        $winner = Winner::where('student_id', $student->id)->latest('created_at')->first();

        if (!$winner) {
            return response()->json(['won' => false, 'winner' => null], Response::HTTP_OK);
        }

        $participant = LuckyDrawParticipant::where('student_id', $student->id)->first();

        return response()->json([
            'won' => true,
            'winner' => [
                'id' => $winner->id,
                'prize' => $winner->prize,
                'drawn_at' => $winner->created_at,
                'participant_number' => $participant ? $participant->participant_number : '0000',
            ]
        ], Response::HTTP_OK);
    }
}
