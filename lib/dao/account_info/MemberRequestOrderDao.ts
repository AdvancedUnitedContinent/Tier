import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class MemberRequestOrderDao extends Repository {

    private static instance: MemberRequestOrderDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): MemberRequestOrderDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'member_request_order', ['od_id'], []);
            this.instance = new MemberRequestOrderDao(dao);
        }
        return this.instance;
    }
}

export let memberRequestOrderDao = MemberRequestOrderDao.getInstance();