<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\SiteSetting;

class AccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $username;
    public $password;
    public $departmentNames;
    public $designationNames;
    public $loginUrl;
    public $accountType;
    public $email;
    public $emailPassword;
    public $setting; // Add this property

    public function __construct(
        $name,
        $username,
        $password,
        $departmentNames,
        $designationNames,
        $loginUrl,
        $accountType,
        $email,
        $emailPassword
    ) {
        $this->name = $name;
        $this->username = $username;
        $this->password = $password;
        $this->departmentNames = $departmentNames;
        $this->designationNames = $designationNames;
        $this->loginUrl = $loginUrl;
        $this->accountType = $accountType;
        $this->email = $email;
        $this->emailPassword = $emailPassword;
        $this->setting = SiteSetting::first();
    }

    public function build()
    {
        return $this->subject('Your Account Has Been Created')
            ->view('emails.account_creation')
            ->with([
                'name' => $this->name,
                'username' => $this->username,
                'password' => $this->password,
                'departmentNames' => $this->departmentNames,
                'designationNames' => $this->designationNames,
                'loginUrl' => $this->loginUrl,
                'accountType' => $this->accountType,
                'email' => $this->email,
                'emailPassword' => $this->emailPassword,
                'setting' => $this->setting,
            ]);
    }
}
