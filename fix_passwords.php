<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SuperAdmin;
use App\Models\Member;

echo "Fixing passwords...\n";

// Fix SuperAdmin
$sa = SuperAdmin::where('email', 'superadmin@gmail.com')->first();
if ($sa) {
    $sa->password = 'superadmin@123';
    $sa->save();
    echo "SuperAdmin password fixed: " . $sa->email . "\n";
    echo "Password hash: " . substr($sa->fresh()->password, 0, 20) . "...\n";
} else {
    echo "SuperAdmin not found\n";
}

// Fix Admin Member
$admin = Member::where('email', 'admin@gmail.com')->first();
if ($admin) {
    $admin->password = 'admin@123';
    $admin->save();
    echo "Admin password fixed: " . $admin->email . "\n";
    echo "Password hash: " . substr($admin->fresh()->password, 0, 20) . "...\n";
} else {
    echo "Admin not found\n";
}

echo "Done!\n";
