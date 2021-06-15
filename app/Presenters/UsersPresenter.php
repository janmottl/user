<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use Ublaboo\DataGrid\DataGrid;
use Ublaboo\NetteDatabaseDataSource\NetteDatabaseDataSource;


final class UsersPresenter extends BasePresenter
{
    use MyDatagrid;
    /**
     * @var Nette\Database\Context
     * @inject
     */
    public $database;


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
         * Big inline editing
         */

        /**
         * Filters
         */

        /**
         * Actions
         */

        /**
         * Group action
         */

        /**
         * Columns summary
         */

        /**
         * Localization
         */
        $grid->setTranslator($this->translatorFactory());
    }
}
