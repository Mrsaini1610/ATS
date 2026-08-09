<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Member;

echo "Creating Admin member...\n";

$admin = Member::create([
    'name' => 'Admin',
    'email' => 'admin@gmail.com',
    'phone' => '7733844020',
    'whatsapp_phone' => '7733844020',
    'password' => 'admin@123',
    'status' => 1,
    'roles' => [1], // Admin role
    'slug' => 'admin',
    'created_by' => 1, // Self-created
    'username' => 'admin',
]);

echo "Admin created: {$admin->email}\n";
echo "Password hash: " . substr($admin->password, 0, 20) . "...\n";
