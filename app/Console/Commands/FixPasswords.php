<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Member;
use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;

class FixPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix plain text passwords by hashing them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking and fixing passwords...');

        // Fix SuperAdmin passwords
        $superAdmins = SuperAdmin::all();
        $fixedSuperAdmins = 0;
        foreach ($superAdmins as $superAdmin) {
            // Check if password is not hashed (bcrypt hashes start with $2y$)
            if (!str_starts_with($superAdmin->password, '$2y$') && !str_starts_with($superAdmin->password, '$2a$')) {
                $plainPassword = $superAdmin->password;
                $superAdmin->password = Hash::make($plainPassword);
                $superAdmin->save();
                $this->info("Fixed SuperAdmin: {$superAdmin->email}");
                $fixedSuperAdmins++;
            }
        }

        // Fix Member passwords
        $members = Member::all();
        $fixedMembers = 0;
        foreach ($members as $member) {
            // Check if password is not hashed
            if (!str_starts_with($member->password, '$2y$') && !str_starts_with($member->password, '$2a$')) {
                $plainPassword = $member->password;
                $member->password = Hash::make($plainPassword);
                $member->save();
                $this->info("Fixed Member: {$member->email}");
                $fixedMembers++;
            }
        }

        $this->info("Done! Fixed {$fixedSuperAdmins} SuperAdmins and {$fixedMembers} Members.");
        
        return 0;
    }
}
