<?php

namespace App\Policies;

use App\Models\DriverCost;
use App\Models\User;
use App\Support\Permissions;
use App\Support\Roles;

class DriverCostPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if ($user->hasRole(Roles::MASTER)) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::COSTS_VIEW_ANY) || $user->can(Permissions::COSTS_VIEW_OWN);
    }

    public function view(User $user, DriverCost $driverCost): bool
    {
        return $user->can(Permissions::COSTS_VIEW_ANY) || $driverCost->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::COSTS_CREATE);
    }

    public function update(User $user, DriverCost $driverCost): bool
    {
        if ($user->can(Permissions::COSTS_UPDATE_ANY)) {
            return true;
        }

        return $driverCost->user_id === $user->id && $user->can(Permissions::COSTS_UPDATE_OWN);
    }

    public function delete(User $user, DriverCost $driverCost): bool
    {
        return $user->can(Permissions::RECORDS_DELETE);
    }
}
