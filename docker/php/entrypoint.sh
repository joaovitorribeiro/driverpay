#!/bin/sh
set -eu

DOCKER_MODE="${DOCKER_MODE:-${APP_ENV:-local}}"
CONTAINER_ROLE="${CONTAINER_ROLE:-app}"

umask 002

mkdir -p \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

if [ "$(id -u)" -eq 0 ] && command -v chown >/dev/null 2>&1; then
  chown -R www-data:www-data storage bootstrap/cache || true
fi

chmod -R ug+rwX storage bootstrap/cache || true

if [ "$DOCKER_MODE" = "legacy" ]; then
  exec /usr/local/bin/start-local
fi

if [ "$DOCKER_MODE" = "dev" ]; then
  if [ ! -f .env ]; then
    cp .env.example .env
  fi

  if [ -z "${APP_KEY:-}" ]; then
    php artisan key:generate --force --no-ansi
  fi

  if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist
  fi

  if [ ! -f bootstrap/cache/packages.php ] || [ ! -f bootstrap/cache/services.php ]; then
    php artisan package:discover --no-ansi
  fi

  if [ "${RUN_MIGRATIONS:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
    php artisan migrate --force --no-ansi
  fi

  if [ "${RUN_SEEDERS:-false}" = "true" ] || [ "${RUN_SEEDERS:-0}" = "1" ]; then
    php artisan db:seed --force --no-ansi
  fi

  case "$CONTAINER_ROLE" in
    app)
      exec php-fpm -F
      ;;
    queue)
      exec php artisan queue:work --sleep=1 --tries=1 --timeout=0 --no-ansi
      ;;
    scheduler)
      exec php artisan schedule:work --no-ansi
      ;;
    *)
      exec "$@"
      ;;
  esac
fi

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY não definido. Configure no Coolify (ex.: APP_KEY=base64:...)." >&2
  exit 1
fi

if [ ! -f bootstrap/cache/packages.php ] || [ ! -f bootstrap/cache/services.php ]; then
  php artisan package:discover --no-ansi
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  php artisan migrate --force --no-ansi
fi

if [ "${RUN_SEEDERS:-false}" = "true" ] || [ "${RUN_SEEDERS:-0}" = "1" ]; then
  php artisan db:seed --force --no-ansi
fi

case "$CONTAINER_ROLE" in
  app)
    if command -v apache2-foreground >/dev/null 2>&1; then
      exec apache2-foreground
    fi
    exec php-fpm -F
    ;;
  queue)
    exec php artisan queue:work --sleep=1 --tries=1 --timeout=0 --no-ansi
    ;;
  scheduler)
    exec php artisan schedule:work --no-ansi
    ;;
  *)
    exec "$@"
    ;;
esac
