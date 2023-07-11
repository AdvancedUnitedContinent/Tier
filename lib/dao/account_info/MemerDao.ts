import {Repository} from "../Repository";
import {DatabaseConnectionConfig} from "../DatabaseConnectionConfig";

let mysqlDao = require('../../utils/mysqlDao');

class MemberDao extends Repository {

    private static instance: MemberDao;

    private constructor(dao) {
        super(dao);
    }

    public static getInstance(): MemberDao {
        if (!this.instance) {
            let dao = new mysqlDao.MySqlDao(new DatabaseConnectionConfig().getDatabaseAccountInfo(), 'account_info', 'member', ['mb_no'], []);
            this.instance = new MemberDao(dao);
        }
        return this.instance;
    }
}

export let memberDao = MemberDao.getInstance();
