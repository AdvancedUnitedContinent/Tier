import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class BlockTransactionsDao extends Repository {

    private static instance: BlockTransactionsDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): BlockTransactionsDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'block_transactions', ['block_number'], []);
            this.instance = new BlockTransactionsDao(dao);
        }
        return this.instance;
    }
}

export let blockTransactionsDao = BlockTransactionsDao.getInstance();