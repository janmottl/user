<?php


namespace App\Presenters;

use Ublaboo\DataGrid\DataGrid;
use Ublaboo\DataGrid\Localization\SimpleTranslator;

trait MyDatagrid
{
    /**
     * Localization
     */
    protected function translatorFactory() {
        return new SimpleTranslator([
            'ublaboo_datagrid.no_item_found_reset' => 'Žádné záznamy nebyly nalezeny. Filtr můžete vynulovat',
            'ublaboo_datagrid.no_item_found' => 'Žádné záznamy nebyly nalezeny',
            'ublaboo_datagrid.here' => 'zde',
            'ublaboo_datagrid.items' => 'Záznamy',
            'ublaboo_datagrid.all' => 'všechny',
            'ublaboo_datagrid.from' => 'z',
            'ublaboo_datagrid.reset_filter' => 'Resetovat filtr',
            'ublaboo_datagrid.group_actions' => 'Hromadné akce',
            'ublaboo_datagrid.show_all_columns' => 'Zobrazit všechny sloupce',
            'ublaboo_datagrid.show_default_columns' => 'Zobrazit přednastavené sloupce',
            'ublaboo_datagrid.hide_column' => 'Skrýt sloupec',
            'ublaboo_datagrid.action' => '', // 'Akce'
            'ublaboo_datagrid.previous' => 'Předchozí',
            'ublaboo_datagrid.next' => 'Další',
            'ublaboo_datagrid.choose' => 'Vyberte',
            'ublaboo_datagrid.execute' => 'Provést',
            'ublaboo_datagrid.edit' => 'Editovat',
            'ublaboo_datagrid.show' => 'Zobrazit podrobnosti',
            'ublaboo_datagrid.cancel' => 'Storno',
            'ublaboo_datagrid.save' => 'Uložit',
            'ublaboo_datagrid.add' => 'Nový',
            'ublaboo_datagrid.multiselect_choose' => 'Vyberte jednu nebo více možností (Ctrl+klik)',

            'Name' => 'Jméno',
            'Inserted' => 'Vloženo'
        ]);
    }

    protected function resetGrid(DataGrid $grid, $force=false) {
        $isExport = strpos($this->getHttpRequest()->getQuery('do'), '-export') !== false;

        if (!$isExport && (!$this->isAjax() || $force)) {
            //
            // pri otevreni stranky vynulovat nastaveni. Pouze ponechat pocet zaznamu na stranku
            //
            $resetGrid = $this->getHttpRequest()->getQuery('resetGrid') === '1';

            $grid->deleteSessionData('_grid_page');    // takto se vynuluje aktualni page */
            $perPage = $grid->getSessionData('_grid_per_page');
            $columns = $grid->getSessionData('_grid_hidden_columns');

            $grid->deleteSessionData('_grid_has_filtered');
            $grid->deleteSessionData('_grid_has_sorted');
            $grid->deleteSessionData('_grid_sort');
            $grid->deleteSessionData('_grid_hidden_columns');

            foreach ($grid->getSessionData() as $key => $value) {
                if (!in_array($key, [
                    '_grid_per_page',
                    '_grid_sort',
                    '_grid_page',
                    '_grid_has_filtered',
                    '_grid_has_sorted',
                    '_grid_hidden_columns',
                    '_grid_hidden_columns_manipulated',
                ], true)) {
                    $grid->deleteSessionData($key);
                }
            }

            $grid->filter = [];
            $grid->sort = [];
            $grid->page = 1;
            $grid->saveSessionData('_grid_per_page', $perPage);

            if ($resetGrid) {
                $grid->saveSessionData('_grid_hidden_columns_manipulated', false);
            } else {
                $grid->saveSessionData('_grid_hidden_columns', $columns);
                $grid->saveSessionData('_grid_hidden_columns_manipulated', true);
            }
        } else {
            $resetGrid = $this->getHttpRequest()->getQuery('resetGrid') === '1';

            if ($resetGrid) {
                //
                // vynulovat nastaveni. Pouze ponechat pocet zaznamu na stranku
                //
                $grid->deleteSessionData('_grid_page');    // takto se vynuluje aktualni page */
                $perPage = $grid->getSessionData('_grid_per_page');

                $grid->deleteSessionData('_grid_has_filtered');
                $grid->deleteSessionData('_grid_has_sorted');
                $grid->deleteSessionData('_grid_sort');
                $grid->deleteSessionData('_grid_hidden_columns');

                foreach ($grid->getSessionData() as $key => $value) {
                    if (!in_array($key, [
                        '_grid_per_page',
                        '_grid_sort',
                        '_grid_page',
                        '_grid_has_filtered',
                        '_grid_has_sorted',
                        '_grid_hidden_columns',
                        '_grid_hidden_columns_manipulated',
                    ], true)) {
                        $grid->deleteSessionData($key);
                    }
                }

                $grid->filter = [];
                $grid->sort = [];
                $grid->page = 1;
                $grid->saveSessionData('_grid_per_page', $perPage);
                $grid->saveSessionData('_grid_hidden_columns_manipulated', false);
            }
        }
    }
}