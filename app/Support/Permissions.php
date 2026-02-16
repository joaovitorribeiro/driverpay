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

    public static function getPermissions(string $role): array
    {
        return match ($role) {
            Roles::MASTER => [
                self::LOGS_VIEW,
                self::USERS_MANAGE,
                self::RECORDS_DELETE,
                self::COSTS_VIEW_ANY,
                self::COSTS_VIEW_OWN,
                self::COSTS_CREATE,
                self::COSTS_UPDATE_ANY,
                self::COSTS_UPDATE_OWN,
            ],
            Roles::ADMIN => [
                self::USERS_MANAGE,
                self::COSTS_VIEW_ANY,
                self::COSTS_VIEW_OWN,
                self::COSTS_CREATE,
                self::COSTS_UPDATE_ANY,
                self::COSTS_UPDATE_OWN,
            ],
            Roles::DRIVER => [
                self::COSTS_VIEW_OWN,
                self::COSTS_CREATE,
                self::COSTS_UPDATE_OWN,
            ],
            default => [],
        };
    }
}
