<?php

namespace App\Support;

final class Permissions
{
    public const LOGS_VIEW = 'logs.view';
    public const USERS_MANAGE = 'users.manage';
    public const RECORDS_DELETE = 'records.delete';

    public const COSTS_VIEW_ANY = 'costs.viewAny';
    public const COSTS_VIEW_OWN = 'costs.viewOwn';
    public const COSTS_CREATE = 'costs.create';
    public const COSTS_UPDATE_ANY = 'costs.updateAny';
    public const COSTS_UPDATE_OWN = 'costs.updateOwn';
}
