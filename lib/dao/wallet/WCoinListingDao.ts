import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class WCoinListingDao extends Repository {

    private static instance: WCoinListingDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): WCoinListingDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseWallet(), "wallet", 'w_coin_listing', ['coin_key', 'service_key'], []);
            this.instance = new WCoinListingDao(dao);
        }
        return this.instance;
    }
}

export let wCoinListingDao = WCoinListingDao.getInstance();
