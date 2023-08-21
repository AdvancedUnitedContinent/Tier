import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class WithdrawWalletAddrDao extends Repository {

    private static instance: WithdrawWalletAddrDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): WithdrawWalletAddrDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'withdraw_wallet_addr', ['w_id'], []);
            this.instance = new WithdrawWalletAddrDao(dao);
        }
        return this.instance;
    }
}

export let withdrawWalletAddrDao = WithdrawWalletAddrDao.getInstance();
