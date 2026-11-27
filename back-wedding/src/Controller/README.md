# Controllers séparés — Efficiency Wedding

Cette version remplace le gros `ApiController.php` par un contrôleur par module/page.

## Contrôleurs
- HealthController
- EventController
- ClientController
- ReservationController
- AppointmentController
- ServiceController
- TaskController
- QuoteController
- InvoiceController
- FinanceReceiptController
- FinanceExpenseController
- SalaryController
- ServerController
- TeamController
- EquipmentController

## CRUD
Chaque module expose maintenant GET liste, POST création, PUT/PATCH modification et DELETE suppression.
Les modules qui n'avaient pas d'UPDATE dans l'ancien contrôleur ont reçu un endpoint UPDATE :
- receipts
- expenses
- team
- equipment

## Installation
Copier tous les fichiers `.php` dans :
`src/Controller/`

Puis supprimer l'ancien `ApiController.php` seulement après avoir vérifié les routes.

Commandes recommandées :
`php bin/console cache:clear`
`php bin/console debug:router`
`php bin/console lint:container`
`php bin/console doctrine:schema:validate`

Les routes restent sous `/api`, donc le frontend peut continuer à appeler `/api/events`, `/api/clients`, etc.
