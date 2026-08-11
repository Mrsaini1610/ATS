<?php

namespace App\Enums;

enum ActionTypeEnum: string
{
    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case CREATE = 'create';
    case UPDATE = 'update';
    case DELETE = 'delete';
}

