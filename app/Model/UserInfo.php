<?php

declare(strict_types=1);

namespace App\Model;

use Nette;


class UserInfo extends DatabaseManager
{
    /**
     * @return array
     */
    public function getAllUsers() : array
    {
        $result = [];

        $selection = $this->database->table(UserManager::TABLE_NAME)
            ->select('user_id, name, surname, email')
            ->order(UserManager::COLUMN_ID.' ASC');

        foreach ($selection as $item) {
            $result[$item[UserManager::COLUMN_ID]] = $item->toArray();
        }
        return $result;
    }

    /**
     * @param string $userId
     * @return array
     */
    public function getUserDetail(string $userId) : array {
        $userDetail = [];

        $userFetch = $this->database->table(UserManager::TABLE_NAME)
            ->select('user_id, email, name, surname, phone, mobile')
            ->where(UserManager::COLUMN_ID, $userId)
            ->fetch();

        $userAddressFetch = $this->database->table(UserAddressManager::TABLE_NAME)
            ->select('user_address_id, user_adresa, user_stat, user_obec_psc, user_obec_nazev')
            ->where(UserAddressManager::COLUMN_USER_ID, $userId)
            ->order(UserAddressManager::COLUMN_ID.' ASC')
            ->fetchAll();

        if (($userFetch !== false) && ($userAddressFetch !== false)) {
            $userDetail = $userFetch->toArray();
            $addresses = [];
            foreach ($userAddressFetch as $item) {
                $addresses[$item[UserAddressManager::COLUMN_ID]] = $item->toArray();
            }
            $userDetail['address'] = $addresses;
        }

        return $userDetail;
    }
}