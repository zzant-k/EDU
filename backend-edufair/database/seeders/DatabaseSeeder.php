<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\University;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Super Admin User
        User::create([
            'name' => 'admin',
            'password' => Hash::make('admin123'),
            'role' => 'superadmin',
        ]);

        // 2. Seed Test Student User
        User::create([
            'name' => 'student',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        // 3. Seed Sample Universities & their Admins
        $universities = [
            [
                'name' => 'Binus University',
                'description' => 'A world-class university in Jakarta specializing in computing, business, and creative technology.',
                'website' => 'https://binus.ac.id',
                'location' => 'Main Hall - Booth A1',
                'qr_token' => 'binus-booth-uuid-token-01',
                'admin_username' => 'admin_binus',
            ],
            [
                'name' => 'Universitas Indonesia',
                'description' => 'One of the oldest and most prestigious national universities in Indonesia, located in Depok.',
                'website' => 'https://ui.ac.id',
                'location' => 'Main Hall - Booth A2',
                'qr_token' => 'ui-booth-uuid-token-02',
                'admin_username' => 'admin_ui',
            ],
            [
                'name' => 'Institut Teknologi Bandung',
                'description' => 'Premier technology and engineering research university located in Bandung, West Java.',
                'website' => 'https://itb.ac.id',
                'location' => 'Main Hall - Booth B1',
                'qr_token' => 'itb-booth-uuid-token-03',
                'admin_username' => 'admin_itb',
            ],
            [
                'name' => 'Universitas Gadjah Mada',
                'description' => 'A leading public research university in Yogyakarta, renowned for its diverse programs and research.',
                'website' => 'https://ugm.ac.id',
                'location' => 'Main Hall - Booth B2',
                'qr_token' => 'ugm-booth-uuid-token-04',
                'admin_username' => 'admin_ugm',
            ],
            [
                'name' => 'Universitas Airlangga',
                'description' => 'Top public university in Surabaya with a strong reputation in medicine and social sciences.',
                'website' => 'https://unair.ac.id',
                'location' => 'Annex Hall - Booth C1',
                'qr_token' => 'unair-booth-uuid-token-05',
                'admin_username' => 'admin_unair',
            ],
            [
                'name' => 'Universitas Padjadjaran',
                'description' => 'Renowned public university in Bandung offering highly-rated programs in medicine, law, and communications.',
                'website' => 'https://unpad.ac.id',
                'location' => 'Annex Hall - Booth C2',
                'qr_token' => 'unpad-booth-uuid-token-06',
                'admin_username' => 'admin_unpad',
            ],
            [
                'name' => 'Universitas Diponegoro',
                'description' => 'A leading university in Semarang known for engineering, marine sciences, and law.',
                'website' => 'https://undip.ac.id',
                'location' => 'Annex Hall - Booth D1',
                'qr_token' => 'undip-booth-uuid-token-07',
                'admin_username' => 'admin_undip',
            ],
            [
                'name' => 'Universitas Brawijaya',
                'description' => 'A dynamic public university in Malang with excellent agricultural, administrative, and engineering programs.',
                'website' => 'https://ub.ac.id',
                'location' => 'Annex Hall - Booth D2',
                'qr_token' => 'ub-booth-uuid-token-08',
                'admin_username' => 'admin_ub',
            ],
        ];

        foreach ($universities as $uniData) {
            $adminUser = User::create([
                'name' => $uniData['admin_username'],
                'password' => Hash::make('password'),
                'role' => 'university_admin',
            ]);

            University::create([
                'name' => $uniData['name'],
                'description' => $uniData['description'],
                'website' => $uniData['website'],
                'location' => $uniData['location'],
                'qr_token' => $uniData['qr_token'],
                'admin_id' => $adminUser->id,
            ]);
        }
    }
}
