<?php

declare(strict_types=1);

namespace App\Model;

use Nette;
use Nette\Utils\Json;


class UserInfo extends DatabaseManager
{
    /**
     * @return string $users
     */
    public function getAllUsers() : string
    {
        $users = null;

        $fetch = $this->database->table(UserManager::TABLE_NAME)
            ->select('user_id, name, surname, email')
            ->order(UserManager::COLUMN_ID.' ASC')
            ->fetch();

        if ($users !== false) {
            $users = Json::encode($fetch, Json::PRETTY | Json::ESCAPE_UNICODE);
        }
        return  $users;
    }

    /**
     * @var string $userId
     * @return string $userDetail
     */
    public function getUserDetail(string $userId) : string {
        $userDetail = '';

        $userFetch = $this->database->table(UserManager::TABLE_NAME)
            ->select('user_id, email, name, surname, phone, mobile')
            ->where(UserManager::COLUMN_ID, $userId)
            ->fetch();

        $userAddressFetch = $this->database->table(UserAddressManager::TABLE_NAME)
            ->select('*')
            ->where(UserAddressManager::COLUMN_USER_ID, $userId)
            ->order(UserAddressManager::COLUMN_ID.' ASC')
            ->fetch();

        if (($userFetch !== false) && ($userAddressFetch !== false)) {
            $user = $userFetch->toArray();
            $userAddress = $userAddressFetch->toArray();
            $user['address'] = $userAddress;
            $userDetail = Json::encode($user, Json::PRETTY | Json::ESCAPE_UNICODE);
        }

        return $userDetail;
    }
}