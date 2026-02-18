<?php

namespace App\Support;

class MercadoPagoWebhookSignature
{
    public static function verify(
        string $secret,
        ?string $xSignature,
        ?string $xRequestId,
        ?string $dataId,
    ): bool {
        if (trim($secret) === '' || ! is_string($xSignature) || trim($xSignature) === '') {
            return false;
        }

        if (! is_string($xRequestId) || trim($xRequestId) === '') {
            return false;
        }

        if (! is_string($dataId) || trim($dataId) === '') {
            return false;
        }

        $parts = array_map('trim', explode(',', $xSignature));
        $ts = null;
        $v1 = null;

        foreach ($parts as $part) {
            [$k, $v] = array_pad(explode('=', $part, 2), 2, null);
            if ($k === 'ts') {
                $ts = is_string($v) ? trim($v) : null;
            } elseif ($k === 'v1') {
                $v1 = is_string($v) ? trim($v) : null;
            }
        }

        if (! is_string($ts) || $ts === '' || ! is_string($v1) || $v1 === '') {
            return false;
        }

        $manifest = "id:{$dataId};request-id:{$xRequestId};ts:{$ts};";
        $computed = hash_hmac('sha256', $manifest, $secret);

        return hash_equals($computed, $v1);
    }
}
