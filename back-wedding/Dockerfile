FROM php:8.2-fpm

WORKDIR /var/www/html

# --no-install-recommends + nettoyage des listes apt : image plus petite, moins de CVE.
# git n'est plus installé : composer télécharge des archives zip (--prefer-dist),
# et git tirait openssh-client (CVE sans correctif publié).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install pdo_pgsql pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Copie explicite au lieu de "COPY . ." : seul le nécessaire entre dans l'image.
# Si un dossier est ajouté au projet (templates, translations...), l'ajouter ici.
COPY composer.json composer.lock symfony.lock ./
COPY bin ./bin
COPY config ./config
COPY migrations ./migrations
COPY public ./public
COPY src ./src

RUN if [ ! -f .env ]; then \
        printf '%s\n' \
        "APP_ENV=${APP_ENV:-prod}" \
        "APP_SECRET=${APP_SECRET:-change_me}" \
        "DEFAULT_URI=${DEFAULT_URI:-http://localhost}" \
        "CORS_ALLOW_ORIGIN=${CORS_ALLOW_ORIGIN:-^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?$}" \
        "DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/app?serverVersion=16&charset=utf8}" \
        > .env; \
    fi

RUN composer install --no-interaction --prefer-dist --no-progress --no-dev --optimize-autoloader \
    && php bin/console cache:clear --env=prod \
    && php bin/console cache:warmup --env=prod \
    && chown -R www-data:www-data var

# Exécution sans droits root (le port 8000 est > 1024, aucun droit spécial requis)
USER www-data

EXPOSE 8000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8000} -t public"]
