import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class WFixUserWalletDao extends Repository {

    private static instance: WFixUserWalletDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): WFixUserWalletDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseWallet(), "wallet", 'w_fix_user_wallet', ['idx'], []);
            this.instance = new WFixUserWalletDao(dao);
        }
        return this.instance;
    }
}

export let wFixUserWalletDao = WFixUserWalletDao.getInstance();
