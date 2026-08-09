<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\SuperAdmin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first super admin to use as creator
        $superAdmin = SuperAdmin::first();
        
        if (!$superAdmin) {
            $this->command->error('No Super Admin found. Please run SuperAdminSeeder first.');
            return;
        }

        // Create test member
        Member::create([
            'uuid' => (string) Str::uuid(),
            'created_by' => $superAdmin->id,
            'name' => 'Test Member',
            'username' => 'testmember',
            'email' => 'member@gmail.com',
            'phone' => '9876543210',
            'password' => Hash::make('member@123'),
            'status' => '1',
            'roles' => [3], // Member role ID
            'slug' => 'test-member',
            'dob' => '1995-01-01',
            'gender' => 'male',
        ]);

        $this->command->info('Test Member created successfully!');
        $this->command->info('Email: member@gmail.com');
        $this->command->info('Password: member@123');
    }
}
