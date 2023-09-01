import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class MemberWalletAddrDao extends Repository {

    private static instance: MemberWalletAddrDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): MemberWalletAddrDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'member_wallet_addr', ['w_id'], []);
            this.instance = new MemberWalletAddrDao(dao);
        }
        return this.instance;
    }
}

export let memberWalletAddrDao = MemberWalletAddrDao.getInstance();
