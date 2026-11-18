<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\University;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\LuckyDrawParticipant;
use Illuminate\Support\Str;

class LuckyDrawSeeder extends Seeder
{
    public function run(): void
    {
        $universities = University::all();
        $uniIds = $universities->pluck('id')->toArray();

        for ($i = 1; $i <= 20; $i++) {
            $student = User::firstOrCreate([
                'name' => 'Lucky Candidate ' . $i,
            ], [
                'password' => Hash::make('password'),
                'role' => 'student',
            ]);

            // Ensure this student visited ALL universities
            foreach ($uniIds as $uniId) {
                DB::table('student_visits')->insertOrIgnore([
                    'student_id' => $student->id,
                    'university_id' => $uniId,
                    'visited_at' => now()->subMinutes(rand(1, 1000)),
                ]);
            }

            LuckyDrawParticipant::firstOrCreate([
                'student_id' => $student->id,
            ], [
                'joined_at' => now(),
            ]);
        }
    }
}
