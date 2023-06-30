import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class CoinDao extends Repository {

    private static instance: CoinDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): CoinDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseCoinInfo(), 'coin_info', 'coin', ['coin_no'], []);
            this.instance = new CoinDao(dao);
        }
        return this.instance;
    }
}

export let coinDao = CoinDao.getInstance();
