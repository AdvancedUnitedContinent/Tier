import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class WCoinDao extends Repository {

    private static instance: WCoinDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): WCoinDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseWallet(), "wallet", 'w_coin', ['coin_key'], []);
            this.instance = new WCoinDao(dao);
        }
        return this.instance;
    }
}

export let wCoinDao = WCoinDao.getInstance();