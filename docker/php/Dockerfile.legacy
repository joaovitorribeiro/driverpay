FROM php:8.3-cli

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git gnupg libicu-dev libpq-dev libzip-dev locales postgresql pgbouncer redis-server supervisor unzip autoconf g++ make pkg-config \
    && sed -i 's/^# *en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && docker-php-ext-install pdo_pgsql zip intl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get purge -y --auto-remove autoconf g++ make pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker/php/conf.d/opcache.ini $PHP_INI_DIR/conf.d/opcache.ini

COPY docker/php/start.sh /usr/local/bin/start
RUN chmod +x /usr/local/bin/start

EXPOSE 8000 5173 5432 6543 6379

ENTRYPOINT ["/usr/local/bin/start"]
