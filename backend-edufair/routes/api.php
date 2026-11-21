<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\UniversityAdminController;
use Illuminate\Support\Facades\Route;

// Public Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Universal Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [StudentController::class, 'getProfile']);

    // Student specific routes
    Route::prefix('student')->group(function () {
        Route::get('/dashboard', [StudentController::class, 'getDashboard']);
        Route::get('/universities/{id}', [StudentController::class, 'getUniversityDetail']);
        Route::post('/scan', [StudentController::class, 'scanQR']);
        Route::get('/leaderboard', [StudentController::class, 'getLeaderboard']);
        Route::post('/universities/{id}/point', [StudentController::class, 'rateUniversity']);
        Route::get('/profile', [StudentController::class, 'getProfile']);
        Route::post('/join-lucky-draw', [StudentController::class, 'joinLuckyDraw']);
        Route::get('/participant', [StudentController::class, 'getParticipant']);
        Route::get('/lucky-draw/winners', [SuperAdminController::class, 'getWinners']);
        Route::get('/announcements', [StudentController::class, 'getActiveAnnouncements']);
    });

    // Super Admin specific routes (Guarded by superadmin middleware)
    Route::prefix('superadmin')->middleware('superadmin')->group(function () {
        Route::get('/stats', [SuperAdminController::class, 'getStats']);
        Route::get('/leaderboard', [SuperAdminController::class, 'getLeaderboard']);
        
        // CRUD University Admins
        Route::get('/university-admins', [SuperAdminController::class, 'listUniversityAdmins']);
        Route::post('/university-admins', [SuperAdminController::class, 'storeUniversityAdmin']);
        Route::put('/university-admins/{id}', [SuperAdminController::class, 'updateUniversityAdmin']);
        Route::delete('/university-admins/{id}', [SuperAdminController::class, 'destroyUniversityAdmin']);

        // CRUD Universities
        Route::get('/universities', [SuperAdminController::class, 'listUniversities']);
        Route::post('/universities', [SuperAdminController::class, 'storeUniversity']);
        Route::post('/universities/{id}', [SuperAdminController::class, 'updateUniversity']); // Using POST for file uploads
        Route::delete('/universities/{id}', [SuperAdminController::class, 'destroyUniversity']);

        // Student Management
        Route::get('/students', [SuperAdminController::class, 'listStudents']);
        Route::get('/students/{id}/progress', [SuperAdminController::class, 'getStudentProgress']);

        // Lucky Draw
        Route::get('/lucky-draw/participants', [SuperAdminController::class, 'listParticipants']);
        Route::post('/lucky-draw/spin', [SuperAdminController::class, 'spinLuckyDraw']);
        Route::get('/lucky-draw/winners', [SuperAdminController::class, 'getWinners']);
        Route::delete('/lucky-draw/winners/{id}', [SuperAdminController::class, 'destroyWinner']);

        // Announcements Broadcast
        Route::get('/announcements', [SuperAdminController::class, 'listAnnouncements']);
        Route::post('/announcements', [SuperAdminController::class, 'storeAnnouncement']);
        Route::put('/announcements/{id}/toggle', [SuperAdminController::class, 'toggleAnnouncement']);
        Route::delete('/announcements/{id}', [SuperAdminController::class, 'destroyAnnouncement']);
    });

    // University Admin specific routes (Guarded by university_admin middleware)
    Route::prefix('university-admin')->middleware('university_admin')->group(function () {
        Route::get('/dashboard', [UniversityAdminController::class, 'getDashboard']);
        Route::get('/leaderboard', [UniversityAdminController::class, 'getLeaderboard']);
        Route::get('/booth', [UniversityAdminController::class, 'getBooth']);
        Route::post('/booth', [UniversityAdminController::class, 'updateBooth']); // Using POST for file uploads
        Route::get('/visitors', [UniversityAdminController::class, 'getVisitors']);
    });
});
