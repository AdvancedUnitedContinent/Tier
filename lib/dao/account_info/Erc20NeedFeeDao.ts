import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');


class Erc20NeedFeeDao extends Repository {

    private static instance: Erc20NeedFeeDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): Erc20NeedFeeDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'erc20_need_fee', ['txid'], []);
            this.instance = new Erc20NeedFeeDao(dao);
        }
        return this.instance;
    }
}

export let erc20NeedFeeDao = Erc20NeedFeeDao.getInstance();