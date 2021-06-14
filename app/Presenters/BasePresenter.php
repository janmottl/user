<?php

declare(strict_types=1);

namespace App\Presenters;

use App\Forms\FormFactory;
use Nette;
use Tracy\Debugger;

/**
 * Základní presenter pro všechny ostatní presentery aplikace.
 * @package App\Presenters
 */
abstract class BasePresenter extends Nette\Application\UI\Presenter
{
	/** Zpráva typu informace. */
	const MSG_INFO = 'info';
	/** Zpráva typu úspěch. */
	const MSG_SUCCESS = 'success';
	/** Zpráva typy chyba. */
	const MSG_ERROR = 'danger';
    /** Zpráva typy chyba. */
    const MSG_WARNING = 'warning';

    const MODE_EDIT = 'edit';
    const MODE_VIEW = 'view';

    /** @var FormFactory Továrnička na formuláře. */
    protected FormFactory $formFactory;

    /** @var string $mode */
    protected string $mode;

    /*
    // private $parameters;
    function __construct(FormFactory $formFactory)
    {
        parent::__construct();
        $this->formFactory = $formFactory;
    }
    */

    /**
     * Získává továrnu na formuláře pomocí DI.
     * @param FormFactory $formFactory automaticky injektovaná továrna na formuláře
     */
    public final function injectFormFactory(FormFactory $formFactory)
    {
        $this->formFactory = $formFactory;
    }

	protected function beforeRender()
	{
		parent::beforeRender();

        $this->template->clientVersion = "";
        //$this->template->clientVersion = $this->parameters['clientVersion'];
	}

    public function handleReloadSnippet() {
        //
        //  Reloaduje snippet (jeho formular), flash a hlavicku
        //
        if ($this->isAjax()) {
            $this->mode = $this->getHttpRequest()->getQuery('clicked') == "editovat" ? self::MODE_EDIT : self::MODE_VIEW;
            $snippet = $this->getHttpRequest()->getQuery('snippet');
            $this->redrawControl($snippet);
            $snippetArea = $this->getHttpRequest()->getQuery('snippetArea');
            if (!empty($snippetArea)) {
                $this->redrawControl($snippetArea);
            }
            $headersnippet = $this->getHttpRequest()->getQuery('headerSnippet');
            $this->redrawControl($headersnippet);
        }
    }
}
