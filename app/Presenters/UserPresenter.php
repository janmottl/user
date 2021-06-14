<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
use App\Model\UserManager;
use Nette\Application\UI\Form;
use Nette\Database\UniqueConstraintViolationException;
use Ublaboo\DataGrid\DataGrid;
use Ublaboo\NetteDatabaseDataSource\NetteDatabaseDataSource;


final class UserPresenter extends BasePresenter
{
    /** @var UserManager */
    private UserManager $userManager;

    use MyDatagrid;
    /**
     * @var Nette\Database\Context
     * @inject
     */
    public $db;


    public function __construct(UserManager $userManager)
    {
        parent::__construct();
        $this->userManager = $userManager;
    }

    /**
     * @param string|null
     */
    public function actionEdit(string $id = null)
    {
        if (!empty($id)) {
            if (!($row = $this->userManager->getUser($id))) {
                $this->flashMessage('Uživatel nebyl nalezen.', self::MSG_ERROR);
            } else {
                $this['userForm']->setDefaults($row);
            }
        }
    }

    public function renderEdit(string $id = null) {
        $this->template->isNew = empty($id);

        if (!$this->isAjax()) {
            if (empty($id)) {
                $this->mode = self::MODE_EDIT;
            } else {
                $this->mode = self::MODE_VIEW;
            }
        } else {
            // osetreni kvuli datagridu, ktery vyvolava Ajaxove pozadavky take pri novem zaznamu
            $do = $this->getHttpRequest()->getQuery('do');
            $snippet = $this->getHttpRequest()->getQuery('snippet');
            if (empty($id) ||
                (!empty($do) && strstr($do, 'userAddressesDatagrid')) ||
                (!empty($snippet) && strstr($snippet, 'searchObjednatelSnippet'))) {
                return;
            }
        }

        $this->template->mode = $this->mode;
    }

    protected function createComponentUserForm()
    {
        // Vytvoření formuláře a definice jeho polí.
        $form = $this->formFactory->create();

        $form->addHidden('user_id');

        $form->addHidden(UserManager::COLUMN_UPDATED_TIMESTAMP);

        $form->addText('name', 'Jméno')
            ->setRequired(true);

        $form->addText('surname', 'Příjmení')
            ->setRequired(true);

        $control = $form->addText('email', 'E-mail')
            ->setEmptyValue('@') // předvyplnění zavináče
            ->setRequired(false);
        $control->addCondition(Form::FILLED) // pokud je e-mail vyplněn
            ->addRule(Form::EMAIL);

        $control = $form->addText('phone', 'Telefon')
            ->setRequired(false);
        $control->addCondition(Form::FILLED) //pokud je telefon vyplněn
            ->addRule(Form::PATTERN, 'Chybný formát telefonního čísla', '^[+(]{0,2}[0-9 ().-]{9,}');

        $control = $form->addText('mobile', 'Mobil')
            ->setRequired(false);
        $control->addCondition(Form::FILLED) //pokud je telefon vyplněn
            ->addRule(Form::PATTERN, 'Chybný formát telefonního čísla', '^[+(]{0,2}[0-9 ().-]{9,}');

        $form->addPassword('password', 'Uživatelské heslo')
            ->setRequired()
            ->addRule(Form::MIN_LENGTH, 'Heslo je příliš krátké', 5);


        // Funkce se vykonaná při úspěšném odeslání formuláře a zpracuje zadané hodnoty.
        $form->onSuccess[] = function (Nette\Forms\Form $form, Nette\Utils\ArrayHash $values) {
            try {
                $isNew = empty($values[UserManager::COLUMN_ID]);
                $userId = $values[UserManager::COLUMN_ID];
                $originalTimestamp = $values[UserManager::COLUMN_UPDATED_TIMESTAMP];

                if ($this->userManager->saveUser($values, $userId) > 0) {
                    $this->flashMessage('Uživatel byl úspěšně uložen.', self::MSG_SUCCESS);
                } else {
                    if ($this->userManager->timestampChanged($userId, $originalTimestamp)) {
                        $this->flashMessage('Došlo ke konfliktu. Uživatel byl změněn jiným uživatelem. ', self::MSG_ERROR);
                    } else {
                        // nedošlo k žádé změně polí
                        $this->flashMessage('Nebyla provedena žádná změna.', self::MSG_SUCCESS);
                    }
                }

                if ($this->isAjax() && !$isNew) {
                    $this->mode = self::MODE_VIEW;
                    // znovu vygenerovat formular
                    $this->removeComponent($form);
                    $this->redrawControl('headerSnippet');
                    // prekreslit snippet odpovidajici formulari
                    $this->redrawControl(str_replace('Form', 'Snippet', $form->getName()));
                    $this->actionEdit(strval($userId));
                } else {
                    $this->redirect('User:Edit', $values->user_id);
                }
            } catch (UniqueConstraintViolationException $e) {
                $this->flashMessage('Uživatel již existuje.', self::MSG_ERROR);
            }
        };

        return $form;
    }

    public function actionDelete(int $id) {
    }

    public function createComponentUserAddressesDatagrid($name) {
        /**
         * @type DataGrid
         */
        $grid = new DataGrid($this, $name);
        $grid->setRememberState(TRUE);
        $this->resetGrid($grid);

        $userId = $this->getParameter('id');
        $grid->setStrictSessionFilterValues(FALSE);
        $query = "SELECT *, 1 as edit  FROM user_address WHERE user_id=?";
        $datasource = new NetteDatabaseDataSource($this->db, $query, [$userId]);
        $grid->setPrimaryKey('user_address_id');
        $grid->setDataSource($datasource);
        $grid->setColumnsHideable();

        $path = __DIR__ . '/templates/Users/gridTemplate.latte';
        $grid->setTemplateFile($path);

        /**
         * Columns
         */
        $grid->addColumnText('user_adresa', 'Adresa')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('user_obec_psc', 'PSČ')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('user_obec_nazev', 'Obec')
            ->setSortable()
            ->setFilterText();

        $grid->addColumnText('user_stat', 'Stát')
            ->setSortable()
            ->setFilterText();

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
