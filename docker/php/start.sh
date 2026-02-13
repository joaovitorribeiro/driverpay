#!/bin/sh
set -eu

set_env() {
  key="$1"
  value="$2"
  file=".env"

  if [ ! -f "$file" ]; then
    return
  fi

  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    return
  fi

  printf "%s=%s\n" "$key" "$value" >> "$file"
}

chmod -R 777 storage bootstrap/cache

if [ ! -f .env ]; then
  cp .env.example .env
fi

set_env DB_CONNECTION pgsql
set_env DB_HOST 127.0.0.1
set_env DB_PORT 6543
set_env DB_DATABASE driverpay
set_env DB_USERNAME driverpay
set_env DB_PASSWORD driverpay
set_env DB_SSLMODE disable
set_env DB_EMULATE_PREPARES true

set_env REDIS_HOST 127.0.0.1
set_env REDIS_PORT 6379

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if [ ! -f node_modules/.bin/vite ]; then
  npm ci
fi

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
PG_BINDIR="$(pg_config --bindir)"

mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su -s /bin/sh postgres -c "$PG_BINDIR/initdb -D '$PGDATA' --auth-host=md5 --auth-local=trust"
fi

su -s /bin/sh postgres -c "$PG_BINDIR/pg_ctl -D '$PGDATA' -o \"-c listen_addresses='*' -c password_encryption=md5\" -w start"

su -s /bin/sh postgres -c "psql -v ON_ERROR_STOP=1 --username=postgres --dbname=postgres <<'SQL'
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'driverpay') THEN
    CREATE ROLE driverpay LOGIN PASSWORD 'driverpay';
  END IF;
END
\$\$;
SQL"

if [ "$(su -s /bin/sh postgres -c "psql -tAc \"select 1 from pg_database where datname='driverpay'\"")" != "1" ]; then
  su -s /bin/sh postgres -c "createdb -O driverpay driverpay"
fi

redis-server docker/redis/redis.conf &

mkdir -p /etc/pgbouncer
tr -d '\r' < docker/pgbouncer/pgbouncer.ini | sed '1s/^\xEF\xBB\xBF//' > /etc/pgbouncer/pgbouncer.ini
tr -d '\r' < docker/pgbouncer/userlist.txt | sed '1s/^\xEF\xBB\xBF//' > /etc/pgbouncer/userlist.txt

chown postgres:postgres /etc/pgbouncer/pgbouncer.ini
chown postgres:postgres /etc/pgbouncer/userlist.txt
su -s /bin/sh postgres -c "pgbouncer -v /etc/pgbouncer/pgbouncer.ini" &

php artisan config:clear --no-ansi
php artisan migrate --force --no-ansi
php artisan db:seed --class=Database\\Seeders\\RolePermissionSeeder --force --no-ansi

php artisan queue:work --sleep=1 --tries=1 --timeout=0 --no-ansi &
rm -f public/hot
npm run build

exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload
