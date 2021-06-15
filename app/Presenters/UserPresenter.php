<?php

declare(strict_types=1);

namespace App\Presenters;

use PDOException;
use Nette;
use App\Model\UserManager;
use Nette\Application\UI\Form;
use Nette\Application\Responses;
use Nette\Database\Explorer;

use Ublaboo\DataGrid\DataGrid;
use Ublaboo\NetteDatabaseDataSource\NetteDatabaseDataSource;

use App\Model\AcomplManager;
use App\Model\UserAddressManager;


final class UserPresenter extends BasePresenter
{
    /** @var Explorer $database */
    private Explorer $database;
    /** @var UserManager */
    private UserManager $userManager;
    /** @var UserAddressManager */
    private UserAddressManager $userAddressManager;
    /** @var AcomplManager */
    private AcomplManager $acomplManager;

    use MyDatagrid;
    /** @var bool $reloadGrid */
    private bool $reloadGrid = false;
    /** @var string $userAddressId */
    private string $userAddressId = '';
    /** @var string $userAddressStatName */
    private string $userAddressStatName = '';

    public function __construct(Explorer $database, UserManager $userManager, UserAddressManager $userAddressManager, AcomplManager $acomplManager)
    {
        parent::__construct();
        $this->database = $database;
        $this->userManager = $userManager;
        $this->acomplManager = $acomplManager;
        $this->userAddressManager = $userAddressManager;
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

    /**
     * @param string|null $id
     */
    public function renderEdit(string $id = null) {
        $this->template->isNew = empty($id);
        $this->template->isNewAddress = empty($this->userAddressId);

        if (!$this->isAjax()) {
            if (empty($id)) {
                $this->mode = self::MODE_EDIT;
            } else {
                $this->mode = self::MODE_VIEW;
            }
        } else {
            // osetreni kvuli datagridu, ktery vyvolava Ajaxove pozadavky
            $do = $this->getHttpRequest()->getQuery('do');
            $snippet = $this->getHttpRequest()->getQuery('snippet');
            if (empty($id) || (!empty($do) && strstr($do, 'userAddressesDatagrid'))) {
                return;
            }
        }

        if (isset($this->mode)) {
            $this->template->mode = $this->mode;
        } else {
            $this->template->mode = self::MODE_VIEW;
        }

        if ($this->reloadGrid) {
            $this['userAddressesDatagrid']->reload();
        }
    }

    /**
     * @return Form
     */
    protected function createComponentUserForm()
    {
        // Vytvoření formuláře a definice jeho polí.
        $form = $this->formFactory->create();

        $form->addHidden(UserManager::COLUMN_ID);

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

        $form->addSubmit('save', 'Uložit')
            ->setHtmlAttribute('class', 'save');

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
                    $this->redirect('User:Edit', $userId);
                }
            } catch (PDOException $e) {
                $message = $e->getMessage();
                $this->flashMessage($message, self::MSG_ERROR);
            }
        };
        return $form;
    }

    /**
     * @param $name
     * @throws \Ublaboo\DataGrid\Exception\DataGridException
     */
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
        $datasource = new NetteDatabaseDataSource($this->database, $query, [$userId]);
        $grid->setPrimaryKey('user_address_id');
        $grid->setDataSource($datasource);
        $grid->setColumnsHideable();

        $path = __DIR__ . '/templates/User/gridTemplate.latte';
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

        $grid->addColumnLink('manipulate', 'Akce');

        /**
         * Localization
         */
        $grid->setTranslator($this->translatorFactory());
    }

    /**
     *
     */
    public function handleReloadUserAddress() {
        //
        //  Reloaduje snippet (jeho formular), flash a hlavicku
        //
        if ($this->isAjax()) {
            $this->mode = $this->getHttpRequest()->getQuery('clicked') == "editovat" ? self::MODE_EDIT : self::MODE_VIEW;
            $snippet = $this->getHttpRequest()->getQuery('snippet');
            $this->userAddressId = $this->getHttpRequest()->getQuery('id');
            $this->redrawControl($snippet);
            $headerSnippet = $this->getHttpRequest()->getQuery('headerSnippet');
            $this->redrawControl($headerSnippet);
        }
    }

    /**
     * @throws Nette\Application\AbortException
     */
    public function handleStatAutocomplete() {
        $response = $this->acomplManager->getStatyAutocomplete($this->getHttpRequest()->getQuery('term'),
            $this->getHttpRequest()->getQuery('acceptUnknown'));
        $this->sendResponse(new Responses\JsonResponse($response));
    }

    /**
     * @throws Nette\Application\AbortException
     */
    public function handleStatValidate() {
        $response = $this->acomplManager->statValidate($this->getHttpRequest()->getQuery('kod'),
            $this->getHttpRequest()->getQuery('acceptUnknown'));
        $this->sendResponse(new Responses\JsonResponse($response));
    }

    /**
     * @throws Nette\Application\AbortException
     */
    public function handleObecAutocomplete() {
        $psc = str_replace(' ', '', $this->getHttpRequest()->getQuery('psc'));
        $response = $this->acomplManager->getObceAutocomplete($psc,$this->getHttpRequest()->getQuery('obec'));
        $this->sendResponse(new Responses\JsonResponse($response));
    }

    /**
     * @return string
     */
    public function getStatName() : string {
        return $this->userAddressStatName;
    }

    /**
     * @return Form
     */
    protected function createComponentUserAddressForm()
    {
        // Vytvoření formuláře a definice jeho polí.
        $form = $this->formFactory->create();

        $form->addHidden(UserAddressManager::COLUMN_ID);

        $form->addHidden(UserAddressManager::COLUMN_UPDATED_TIMESTAMP);

        $prefix = 'user_';

        $form->addText($prefix.'adresa', 'Adresa')
            ->addFilter(function ($value) {return str_replace(';', ',', $value);})
            ->setRequired(false)
            ->setHtmlAttribute('class','adresa mapMarker'.' '.$prefix);

        $form->addText($prefix.'obec_psc', 'PSČ')
            ->setRequired(false)
            ->setHtmlAttribute('class',$prefix.'psc'.' '.$prefix);

        $form->addText($prefix.'obec_nazev', 'Obec')
            ->addFilter(function ($value) {return str_replace(';', ',', $value);})
            ->setRequired(false)
            ->setHtmlAttribute('class', 'obec_nazev acomplIcon'.' '.$prefix);

        $form->addText($prefix.'stat', 'Stát')
            ->setHtmlAttribute('class','stat osoba_fo osoba_po acomplIcon'.' '.$prefix)
            ->setHtmlAttribute('data-tooltip-stat', 'addr')
            ->setRequired(false);
            //->addRule('App\Utilities\MyValidators::statValidator', 'Neplatný kód státu');

        $form->addSubmit('save', 'Uložit')
            ->setHtmlAttribute('class', 'save');

        if (!empty($this->userAddressId)) {
            if (!($row = $this->userAddressManager->getUserAddress($this->userAddressId))) {
                $this->flashMessage('Adresa nebyla nalezena.', self::MSG_ERROR);
            } else {
                $form->setDefaults($row);
                $this->userAddressStatName = $this->acomplManager->getStatNazevByKod($row[UserAddressManager::COLUMN_USER_STAT]);
            }
        }

        $form->onSuccess[] = function (Nette\Forms\Form $form, Nette\Utils\ArrayHash $values) {
            try {
                $isNew = empty($values[UserAddressManager::COLUMN_ID]);
                $userId = $this->getParameter('id');
                $values[UserManager::COLUMN_ID] = $userId;
                $userAddressId = $values[UserAddressManager::COLUMN_ID];
                $originalTimestamp = $values[UserAddressManager::COLUMN_UPDATED_TIMESTAMP];

                if ($this->userAddressManager->saveUserAddress($values, $userAddressId) > 0) {
                    $this->flashMessage('Adresa byl úspěšně uložena', self::MSG_SUCCESS);
                } else {
                    if ($this->userAddressManager->timestampChanged($userAddressId, $originalTimestamp)) {
                        $this->flashMessage('Došlo ke konfliktu. Adresa byl změněna jiným uživatelem. ', self::MSG_ERROR);
                    } else {
                        // nedošlo k žádné změně polí
                        $this->flashMessage('Nebyla provedena žádná změna.', self::MSG_SUCCESS);
                    }
                }

                if ($this->isAjax()) {
                    $this->mode = self::MODE_VIEW;
                    $this->userAddressId = strval($userAddressId);
                    // znovu vygenerovat formular
                    $this->removeComponent($form);
                    $this->redrawControl('userAddressHeaderSnippet');
                    // prekreslit snippet odpovidajici formulari
                    $this->redrawControl(str_replace('Form', 'Snippet', $form->getName()));
                }

                // grid reload
                $this->reloadGrid = true;
            } catch (PDOException $e) {
                $message = $e->getMessage();
                $this->flashMessage($message, self::MSG_ERROR);
            }
        };
        return $form;
    }

    public function handleDeleteUserAddress() {
        if ($this->isAjax()) {
            $this->userAddressManager->deleteUserAddress($this->getHttpRequest()->getQuery('id'));
            $this->reloadGrid = true;
        }
    }
}
