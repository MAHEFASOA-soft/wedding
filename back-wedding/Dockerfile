FROM php:8.2-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev unzip git \
    && docker-php-ext-install pdo_pgsql pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

ENV APP_ENV=prod
RUN if [ ! -f .env ]; then echo "APP_ENV=prod" > .env; fi \
    && composer install --no-dev --optimize-autoloader --no-interaction \
    && APP_SECRET=build DATABASE_URL="postgresql://build:build@localhost:5432/build" php bin/console cache:clear --env=prod --no-debug \
    && mkdir -p var public/uploads \
    && chown -R 10001:10001 var public/uploads

USER 10001
EXPOSE 8000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8000} -t public"]
