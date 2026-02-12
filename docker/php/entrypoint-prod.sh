#!/usr/bin/env sh
set -e

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ -z "${APP_KEY:-}" ] && [ -n "${LARAVEL_APP_KEY:-}" ]; then
  export APP_KEY="$LARAVEL_APP_KEY"
fi

php artisan storage:link >/dev/null 2>&1 || true
php artisan package:discover --ansi >/dev/null 2>&1 || true

if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  php artisan migrate --force
fi

exec "$@"
