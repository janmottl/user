<?php

declare(strict_types=1);

namespace App\Model;

use Nette\Database\Table\ActiveRow;
use Nette\Utils\ArrayHash;

class UserManager extends DatabaseManager
{
    const
        TABLE_NAME = 'user',
        COLUMN_ID = 'user_id',
        COLUMN_UPDATED_TIMESTAMP = 'updated_timestamp';
    /**
     * @param string $userId
     * @return false|ActiveRow
     */
    public function getUser(string $userId) : ActiveRow
    {
        return $this->database->table(self::TABLE_NAME)
            ->select('*')
            ->where(self::COLUMN_ID, $userId)
            ->fetch();
    }

    /**
     * @param array|ArrayHash $user
     * @param string &$userId
     * @return int $numUpdated
     */
    public function saveUser(ArrayHash $user, string &$userId) : int
    {
        if (empty($user[self::COLUMN_ID])) {
            unset($user[self::COLUMN_ID]);
            $userId = $this->database->table(self::TABLE_NAME)
                ->insert($user)
                ->getPrimary();
            $numUpdated = !empty($userId) ? 1 : 0;
        } else {
            $userId = $user[self::COLUMN_ID];
            unset($user[self::COLUMN_ID]);
            $originalTimestamp = $user[self::COLUMN_UPDATED_TIMESTAMP];
            unset($user[self::COLUMN_UPDATED_TIMESTAMP]);
            $numUpdated = $this->database->table(self::TABLE_NAME)
                ->where(self::COLUMN_ID, $userId)
                ->where(self::COLUMN_UPDATED_TIMESTAMP, $originalTimestamp)
                ->update($user);
        }

        return $numUpdated;
    }

    /**
     * @param string $userId
     * @param string $original_timestamp
     * @return bool $changed
     */
    public function timestampChanged(string $userId, string $original_timestamp) : bool
    {
        $changed = true;

        $selection = $this->database->table(self::TABLE_NAME)
            ->select(self::COLUMN_UPDATED_TIMESTAMP)
            ->where(self::COLUMN_ID, $userId)->fetch();
        if ($selection !== false) {
            $changed = $original_timestamp != $selection[self::COLUMN_UPDATED_TIMESTAMP];
        }
        return $changed;
    }

    /**
     * @param string $userId
     */
    public function deleteUser(string $userId)
    {
        $this->database->table(self::TABLE_NAME)
            ->where(self::COLUMN_ID, $userId)
            ->delete();
    }
}