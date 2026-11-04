// installe les composants
dans dossier wedding-main>npm install
dans dossier back-wedding>composer install


------------ dans back-wedding -----------------------------------------------
// 1-mettre dans .env le DATABASE_URL
$env:DATABASE_URL = 'postgresql://postgres:root@127.0.0.1:5432/testwedding?serverVersion=16&charset=utf8'

//2-creer de database dans postgresql
php bin/console doctrine:database:create

// 3-creer tout les tables
php bin/console doctrine:schema:validate
php bin/console doctrine:schema:create --dump-sql
php bin/console doctrine:schema:create

// 4-charger des donnees initial en utilisant AppFixture (Exemple des donnees)
php bin/console doctrine:fixtures:load --no-interaction

// 5-modifier la mode de passe d'une compte initial (admin)
php bin/console app:user:set-password miora@efficiencywedding.mg


---------------------------------------------------------------------
//6-executer le code:
>cd back-wedding
back-wedding>php -S localhost:8000 -t public
// ou
back-wedding>php -S 127.0.0.1:8000 -t public

>cd wedding-main
cd wedding-main>npm run dev