<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Support\Roles;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Carbon;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_pro' => 'boolean',
            'pro_bonus_until' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function driverSetting(): HasOne
    {
        return $this->hasOne(DriverSetting::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by_user_id');
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscriptions()
            ->whereIn('status', ['active', 'trialing', 'grace_period'])
            ->where(function ($query) {
                $query
                    ->whereNull('current_period_end_at')
                    ->orWhere('current_period_end_at', '>', now());
            })
            ->exists();
    }

    public function isPaidPro(): bool
    {
        if ((bool) $this->is_pro) {
            return true;
        }

        return $this->hasActiveSubscription();
    }

    public function proAccessUntil(): ?Carbon
    {
        if ($this->hasRole(Roles::MASTER) || $this->hasRole(Roles::ADMIN)) {
            return null;
        }

        $subscriptionEnd = $this->subscriptions()
            ->whereIn('status', ['active', 'trialing', 'grace_period'])
            ->max('current_period_end_at');

        $end = $subscriptionEnd ? Carbon::parse($subscriptionEnd) : null;
        $bonus = $this->pro_bonus_until ? Carbon::parse($this->pro_bonus_until) : null;

        if (! $end) {
            return $bonus;
        }

        if (! $bonus) {
            return $end;
        }

        return $end->greaterThan($bonus) ? $end : $bonus;
    }

    public function proDaysRemaining(): ?int
    {
        $until = $this->proAccessUntil();
        if (! $until) {
            return null;
        }

        $diff = now()->startOfDay()->diffInDays($until->startOfDay(), false);

        return $diff > 0 ? $diff : 0;
    }

    public function isProAccess(): bool
    {
        if ($this->hasRole(Roles::MASTER) || $this->hasRole(Roles::ADMIN)) {
            return true;
        }

        if ((bool) $this->is_pro) {
            return true;
        }

        if ($this->hasActiveSubscription()) {
            return true;
        }

        return $this->pro_bonus_until !== null && $this->pro_bonus_until->isFuture();
    }
}
