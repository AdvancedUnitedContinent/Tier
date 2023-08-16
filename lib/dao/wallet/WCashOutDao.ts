import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class WCashOutDao extends Repository {

    private static instance: WCashOutDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): WCashOutDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseWallet(), "wallet", 'w_cash_out', ['idx'], []);
            this.instance = new WCashOutDao(dao);
        }
        return this.instance;
    }
}

export let wCashOutDao = WCashOutDao.getInstance();
