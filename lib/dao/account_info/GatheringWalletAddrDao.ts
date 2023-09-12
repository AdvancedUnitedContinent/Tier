import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class GatheringWalletAddrDao extends Repository {

    private static instance: GatheringWalletAddrDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): GatheringWalletAddrDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'gathering_wallet_addr', ['w_id'], []);
            this.instance = new GatheringWalletAddrDao(dao);
        }
        return this.instance;
    }
}

export let gatheringWalletAddrDao = GatheringWalletAddrDao.getInstance();