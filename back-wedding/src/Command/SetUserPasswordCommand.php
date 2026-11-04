<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:user:set-password', description: 'Définit le mot de passe d’un compte utilisateur existant')]
class SetUserPasswordCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Adresse email du compte');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = strtolower(trim((string) $input->getArgument('email')));
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            $io->error('Aucun compte ne correspond à cette adresse email.');
            return Command::FAILURE;
        }

        $helper = $this->getHelper('question');
        if (!$helper instanceof QuestionHelper) {
            $io->error('Impossible de demander le mot de passe.');
            return Command::FAILURE;
        }

        $passwordQuestion = new Question('Nouveau mot de passe (8 caractères minimum) : ');
        $passwordQuestion->setHidden(true);
        $passwordQuestion->setHiddenFallback(false);
        $password = $helper->ask($input, $output, $passwordQuestion);

        $confirmationQuestion = new Question('Confirmez le mot de passe : ');
        $confirmationQuestion->setHidden(true);
        $confirmationQuestion->setHiddenFallback(false);
        $confirmation = $helper->ask($input, $output, $confirmationQuestion);

        if (!is_string($password) || strlen($password) < 8 || $password !== $confirmation) {
            $io->error('Les mots de passe ne correspondent pas ou sont trop courts.');
            return Command::FAILURE;
        }

        $user->setPasswordHash(password_hash($password, PASSWORD_DEFAULT));
        $this->entityManager->flush();

        $io->success(sprintf('Mot de passe défini pour %s.', $email));
        return Command::SUCCESS;
    }
}