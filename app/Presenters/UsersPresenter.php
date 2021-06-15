<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use Nette\Database\Explorer;
use Ublaboo\DataGrid\DataGrid;
use Ublaboo\NetteDatabaseDataSource\NetteDatabaseDataSource;

use App\Model\UserManager;
use App\Model\UserInfo;


final class UsersPresenter extends BasePresenter
{
    /**
     * @var UserManager
     */
    private UserManager $userManager;
    /**
     * @var UserInfo
     */
    private UserInfo $userInfo;

    use MyDatagrid;

    /**
     * @var Explorer
     */
    public Explorer $database;
    /** @var bool $reloadGrid */
    private bool $reloadGrid = false;

    public function __construct(Explorer $database, UserManager $userManager, UserInfo $userInfo)
    {
        parent::__construct();
        $this->database = $database;
        $this->userManager = $userManager;
        $this->userInfo = $userInfo;
    }

    /**
     *
     */
    public function renderDefault() {
        if ($this->reloadGrid) {
            $this['usersDatagrid']->reload();
        }
    }

    public function actionData() {
        $this->sendJson($this->userInfo->getAllUsers());
    }

    /**
     * @throws \Ublaboo\DataGrid\Exception\DataGridException
     */
    public function createComponentUsersDatagrid($name) {
        /**
         * @type DataGrid
         */
        $grid = new DataGrid($this, $name);
        $grid->setRememberState(TRUE);
        $this->resetGrid($grid);

        $grid->setStrictSessionFilterValues(FALSE);
        $query = "SELECT *, 1 as edit  FROM user";
        $datasource = new NetteDatabaseDataSource($this->database, $query);
        $grid->setPrimaryKey('user_id');
        $grid->setDataSource($datasource);
        $grid->setColumnsHideable();

        $path = __DIR__ . '/templates/Users/gridTemplate.latte';
        $grid->setTemplateFile($path);

        /**
         * Columns
         */
        $grid->addColumnText('user_id', 'Číslo uživatele')
            ->setAlign('right')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('name', 'Jméno')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('surname', 'Příjmení')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('email', 'E-mail')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('phone', 'Telefon')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('mobile', 'Mobil')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnLink('manipulate', 'Akce');

        /**
         * Localization
         */
        $grid->setTranslator($this->translatorFactory());
    }

    /**
     *
     */
    public function handleDeleteUser() {
        if ($this->isAjax()) {
            $this->userManager->deleteUser($this->getHttpRequest()->getQuery('id'));
            $this->reloadGrid = true;
            $this->redrawControl('usersDatagrid');
        }
    }
}
