<?php

namespace App\Http\Controllers;

use App\Models\PixPayment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingHistoryController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $tab = $request->string('tab')->toString();
        if (! in_array($tab, ['pix', 'subscription'], true)) {
            $tab = 'pix';
        }

        $status = $request->string('status')->toString();
        if (! in_array($status, ['all', 'pending', 'pending_valid', 'in_progress', 'approved', 'cancelled', 'rejected', 'active', 'paused', 'canceled'], true)) {
            $status = 'all';
        }

        $perPage = 10;

        $pixQuery = PixPayment::query()
            ->where('provider', 'mercadopago')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        if ($tab === 'pix' && $status !== 'all') {
            if ($status === 'pending') {
                $pixQuery->where('status', 'pending')->whereNull('paid_at');
            } elseif ($status === 'pending_valid') {
                $pixQuery
                    ->where('status', 'pending')
                    ->whereNull('paid_at')
                    ->whereNotNull('expires_at')
                    ->where('expires_at', '>', now());
            } elseif ($status === 'approved') {
                $pixQuery->where('status', 'approved');
            } elseif ($status === 'cancelled') {
                $pixQuery->whereIn('status', ['cancelled', 'canceled']);
            } elseif ($status === 'rejected') {
                $pixQuery->where('status', 'rejected');
            } elseif ($status === 'in_progress') {
                $pixQuery->whereIn('status', ['in_process', 'in_mediation', 'authorized']);
            }
        }

        $pix = $pixQuery
            ->paginate($perPage)
            ->appends($request->query())
            ->through(fn (PixPayment $p) => [
                'kind' => 'pix',
                'provider' => $p->provider,
                'provider_id' => $p->payment_id,
                'plan' => $p->plan,
                'status' => $p->status,
                'amount_brl' => $p->amount_brl !== null ? (string) $p->amount_brl : null,
                'created_at' => $p->created_at?->toISOString(),
                'expires_at' => $p->expires_at?->toISOString(),
                'resume_url' => ($p->status === 'pending' && $p->paid_at === null && $p->expires_at && $p->expires_at->isFuture())
                    ? route('billing.mercadopago.pix', ['id' => $p->payment_id])
                    : null,
            ]);

        $subQuery = Subscription::query()
            ->where('provider', 'mercadopago')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        if ($tab === 'subscription' && $status !== 'all') {
            if (in_array($status, ['active', 'pending', 'paused', 'canceled'], true)) {
                $subQuery->where('status', $status);
            }
        }

        $subscriptions = $subQuery
            ->paginate($perPage)
            ->appends($request->query())
            ->through(fn (Subscription $s) => [
                'kind' => 'subscription',
                'provider' => $s->provider,
                'provider_id' => $s->purchase_token,
                'plan' => $s->plan,
                'status' => $s->status,
                'amount_brl' => null,
                'created_at' => $s->created_at?->toISOString(),
                'expires_at' => $s->current_period_end_at?->toISOString(),
                'resume_url' => route('billing.mercadopago.portal'),
            ]);

        $pendingPixCount = PixPayment::query()
            ->where('provider', 'mercadopago')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->whereNull('paid_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->count();

        return Inertia::render('Driver/BillingHistory', [
            'tab' => $tab,
            'status' => $status,
            'pix' => $pix,
            'subscriptions' => $subscriptions,
            'summary' => [
                'pending_pix_count' => $pendingPixCount,
            ],
        ]);
    }
}
