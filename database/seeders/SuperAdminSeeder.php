<?php

namespace Database\Seeders;

use App\Models\SuperAdmin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SuperAdmin::create([
            'roles' => ['admin'],
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
            'phone' => '7733844020',
            'whatsapp_phone' => '7733844020',
            'password' => Hash::make('superadmin@123'),
        ]);
    }
}
