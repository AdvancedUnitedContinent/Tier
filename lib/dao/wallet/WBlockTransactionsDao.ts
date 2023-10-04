import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class WBlockTransactionsDao extends Repository {

    private static instance: WBlockTransactionsDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): WBlockTransactionsDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseWallet(), "wallet", 'w_block_transactions', ['idx'], []);
            this.instance = new WBlockTransactionsDao(dao);
        }
        return this.instance;
    }
}

export let wBlockTransactionsDao = WBlockTransactionsDao.getInstance();
