<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SuperAdmin;
use App\Models\Member;

echo "=== Checking existing emails ===\n";

echo "\nSuperAdmins:\n";
$superAdmins = SuperAdmin::all();
foreach ($superAdmins as $sa) {
    echo "- ID: {$sa->id}, Email: {$sa->email}, Phone: {$sa->phone}\n";
}

echo "\nMembers:\n";
$members = Member::all();
foreach ($members as $m) {
    echo "- ID: {$m->id}, Email: {$m->email}, Phone: {$m->phone}, Slug: {$m->slug}\n";
}

echo "\n=== Done ===\n";
