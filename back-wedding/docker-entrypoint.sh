#!/bin/sh
set -e

echo "======================================"
echo "Démarrage du backend Symfony"
echo "======================================"

echo "APP_ENV=$APP_ENV"

echo "Nettoyage du cache Symfony..."
php bin/console cache:clear --env=prod --no-debug

echo "Warmup du cache Symfony..."
php bin/console cache:warmup --env=prod --no-debug

echo "Démarrage d'Apache..."

exec apache2-foreground