<?php

declare(strict_types=1);

namespace App\Model;


use Nette\Database\Table\ActiveRow;
use Nette\Utils\ArrayHash;

class UserAddressManager extends DatabaseManager
{
    const
        TABLE_NAME = 'user_address',
        COLUMN_ID = 'user_address_id',
        COLUMN_USER_ID = 'user_id',
        COLUMN_UPDATED_TIMESTAMP = 'updated_timestamp';
    /**
     * @param string $userId
     * @return false|ActiveRow
     */
    public function getUserAddress(string $userId) : ActiveRow
    {
        return $this->database->table(self::TABLE_NAME)
            ->where(self::COLUMN_ID, $userId)
            ->fetch();
    }

    /**
     * @param array|ArrayHash $userAddress
     * @param string &$userAddressId
     * @return int $numUpdated
     */
    public function saveUserAddress(ArrayHash $userAddress, string &$userAddressId) : int
    {
        if (empty($userAddress[self::COLUMN_ID])) {
            unset($userAddress[self::COLUMN_ID]);
            $userAddressId = $this->database->table(self::TABLE_NAME)
                ->insert($userAddress)
                ->getPrimary();
            $numUpdated = !empty($userAddressId) ? 1 : 0;
        } else {
            $userAddressId = $userAddress[self::COLUMN_ID];
            unset($userAddress[self::COLUMN_ID]);
            $originalTimestamp = $userAddress[self::COLUMN_UPDATED_TIMESTAMP];
            unset($userAddress[self::COLUMN_UPDATED_TIMESTAMP]);
            $numUpdated = $this->database->table(self::TABLE_NAME)
                ->where(self::COLUMN_ID, $userAddressId)
                ->where(self::COLUMN_UPDATED_TIMESTAMP, $originalTimestamp)
                ->update($userAddress);
        }

        return $numUpdated;
    }

    /**
     * @param string $userAddressId
     * @param string $original_timestamp
     * @return bool $changed
     */
    public function timestampChanged(string $userAddressId, string $original_timestamp) : bool
    {
        $changed = true;

        $selection = $this->database->table(self::TABLE_NAME)
            ->select(self::COLUMN_UPDATED_TIMESTAMP)
            ->where(self::COLUMN_ID, $userAddressId)->fetch();
        if ($selection !== false) {
            $changed = $original_timestamp != $selection[self::COLUMN_UPDATED_TIMESTAMP];
        }
        return $changed;
    }

    /**
     * @param string $userAddressId
     */
    public function deleteUserAddress(string $userAddressId)
    {
        $this->database->table(self::TABLE_NAME)
            ->where(self::COLUMN_ID, $userAddressId)
            ->delete();
    }
}