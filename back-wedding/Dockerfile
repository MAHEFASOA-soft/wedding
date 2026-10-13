FROM php:8.2-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo_pgsql pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY . .

RUN if [ ! -f .env ]; then \
        printf '%s\n' \
        "APP_ENV=${APP_ENV:-prod}" \
        "APP_SECRET=${APP_SECRET:-change_me}" \
        "DEFAULT_URI=${DEFAULT_URI:-http://localhost}" \
        "CORS_ALLOW_ORIGIN=${CORS_ALLOW_ORIGIN:-^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?$}" \
        "DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/app?serverVersion=16&charset=utf8}" \
        > .env; \
    fi

RUN composer install --no-interaction --prefer-dist --no-progress --no-dev --optimize-autoloader

RUN php bin/console cache:clear --env=prod \
    && php bin/console cache:warmup --env=prod

EXPOSE 8000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8000} -t public"]