<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEducation extends Model
{
    protected $table = 'user_educations';
    protected $fillable = ['user_id', 'degree', 'institution', 'field_of_study', 'start_year', 'end_year', 'percentage_or_cgpa'];
}
