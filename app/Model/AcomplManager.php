<?php

declare(strict_types=1);


namespace App\Model;


class AcomplManager extends DatabaseManager
{
    /** Konstanty pro manipulaci s modelem. */
    const
        OBEC_TABLE_NAME     = 'acompl_obec',
        OBEC_COLUMN_SEARCH  = 'obec';

    /**
     * @param string $inString
     * @return string
     */
    public static function escapeSqlApostrophe (string $inString) : string
    {
        return str_replace("'", "\'", $inString);
    }

    /**
     * Najde statu podle kodu
     * @param string $kod
     * @return string
     */
    public function getStatNazevByKod(string $kod) : string
    {
        $name = '';
        if (!empty($kod) && ($kod != '*')) {
            $query = "SELECT nazev 
                        FROM acompl_stat_iso  
                       WHERE kod = ?";
            $result = $this->database->query($query, $kod)->fetch();
            $name = $result ? $result['nazev'] : '';
        }
        return $name;
    }

    /**
     * Vyhleda seznam statu podle podretezce v parametru.
     * @param string $searchString podretezec
     * @param string $acceptUnknown podretezec
     * @return array
     */
    public function getStatyAutocomplete(string $searchString, string $acceptUnknown) : array
    {
        $searchString = self::escapeSqlApostrophe($searchString);

        $unknownCond = '';
        if ($acceptUnknown === 'false') {
            $unknownCond = " AND (kod != '?') ";
        }

        if (!is_null($searchString) && strlen($searchString) && ($searchString != '*')) {
            $query = "SELECT CONCAT(kod, ', ', nazev) AS value 
                      FROM acompl_stat_iso  
                      WHERE ((kod LIKE '%$searchString%') OR (nazev LIKE '%$searchString%' collate utf8mb4_general_ci)) $unknownCond
                      ORDER BY (kod LIKE '%$searchString%') DESC, kod ASC, nazev ASC";
        } else {
            $query = "SELECT CONCAT(kod, ', ', nazev) AS value 
                        FROM acompl_stat_iso
                        WHERE (1=1) $unknownCond 
                       ORDER
                          BY kod, nazev";
        }
        $result = $this->database->query($query)->fetchAll();
        return $result;
    }

    /**
     * @param string $kod
     * @param string $acceptUnknown
     * @return array|string[]
     */
    public function statValidate(string $kod, string $acceptUnknown)
    {
        $result = ['returns' => 'false', 'nazev' => ''];
        if (!empty($kod)) {
            $query = "SELECT kod, nazev 
                      FROM acompl_stat_iso  
                      WHERE (kod = '$kod')";
            if ($acceptUnknown === 'false') {
                $query .= " AND (kod != '?')";
            }
            $fetch = $this->database->query($query)->fetch();
            if ($fetch !== false) {
                $result = ['returns' => 'true', 'nazev' => $fetch['nazev'], 'kod' => $fetch['kod']];
            }
        }

        return $result;
    }

    /**
     * Vyhleda seznam obci podle podretezce v parametru.
     * @param string $pscSearchString podretezec
     * @param string $obecSearchString podretezec
     * @return array $result
     */
    public function getObceAutocomplete(string $pscSearchString, string $obecSearchString) : array
    {
        $pscSearchString = self::escapeSqlApostrophe($pscSearchString);
        $obecSearchString = self::escapeSqlApostrophe($obecSearchString);

        $query = "SELECT obec AS value FROM acompl_obec WHERE ";
        $origQueryLen = strlen($query);
        $condPsc = null;
        $condObec = null;

        if (!empty($pscSearchString)) {
            $condPsc = "(psc LIKE '".$pscSearchString."%') ";
        }
        if (!empty($obecSearchString) && ($obecSearchString != '*')) {
            // pro * se nefiltruje podle obce
            $condObec = "(obec LIKE '" . $obecSearchString . "%' collate utf8mb4_general_ci) ";
        }

        if (!empty($condPsc)) {
            $query .= $condPsc;
        }
        if (!empty($condObec)) {
            if (!empty($condPsc)) {
                $query .= ' AND ';
            }
            $query .= $condObec;
        }
        if (strlen($query) <= $origQueryLen)
        {
            // nic nepribylo. Dodat alespon aby byla spravna podminka
            $query .= '(1=1)'; // poslat vse
        }

        $query .= " ORDER BY obec";
        $fetch = $this->database->query($query)->fetchAll();

        if (count($fetch) <= 0) {
            // nic
            $result =[['label' => "žádná obec", 'value' => '{not-valid-value}']];
        } elseif (count($fetch) > 100) {
            // prekrocen max pocet zasilanych obci
            $pocetObci = number_format(count($fetch) - 100, 0, ',', ' ');
            $result = [];

            $i = 1;
            foreach ($fetch as $key => $value) {
                if ($i > 100) {
                    break;
                }
                $result[$i] = $value;
                $i++;
            }
            $result[] = ['label' => "A dalších $pocetObci obcí", 'value' => '{not-valid-value}'];
        } else {
            $result = $fetch;
        }

        return $result;
    }
}
