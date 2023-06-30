
/**
 * DB DAO 공통 함수 모아 놓은 Class
 **/
class Repository {

    dao: any;

    protected constructor(dao) {
        this.dao = dao;
    }

    /**
     * 모두 조회하는 함수
     **/
    async all(): Promise<any> {
        return await this.dao.all();
    }

    /**
     * LIST 조회 함수
     * @param where where JSON 형태의 object
     * *        ex) var where = function() {
				this.where('id', '>', 0);
			};
     **/
    async search(where): Promise<any> {
        return await this.dao.search(where);
    }

    /**
     * LIST 조회 함수
     * @param where where JSON 형태의 object
     * *        ex) var where = function() {
				this.where('id', '>', 0);
			};
     * @param limit Limit
     * @param offset List 시작점
     * @param sortName 정렬 컬럼명
     * @param sortOrder 정렬 순서
     **/
    async selectList(where, limit, offset, sortName, sortOrder): Promise<any> {
        return await this.dao.searchLimit(where, limit, offset, sortName, sortOrder);
    }

    /**
     * COUNT 조회 함수
     * @param column count 할 column
     * @param where where JSON 형태의 object
     *        ex) var where = function() {
				this.where('id', '>', 0);
			};
     **/
    async count(column, where): Promise<any> {
        return await this.dao.count(column, where);
    }

    /**
     * 하나의 데이터를 조회 하는 함수
     * @param where where JSON 형태의 object
     **/
    async searchOne(where): Promise<any> {
        return (await this.dao.searchOne(where))[0];
    }

    /**
     * 데이터 INSERT 함수
     * @param recode 넣을 JSON
     **/
    async insert(recode): Promise<any> {
        return await this.dao.add(recode);
    }

    /**
     * 데이터 UPDATE 함수
     * @param where  where JSON 형태의 object
     * @param update 수정할 JSON
     * UPDATE 는 []형태로 받지 못한다.
     **/
    async update(where, update): Promise<any> {
        return await this.dao.update(where, update);
    }

    /**
     * QUERY 직접 날리는 함수
     * @param query String 형태의 query
     **/
    async query(query): Promise<any> {
        return await this.dao.query(query);
    }

    /**
     * LIST 조회 함수
     * @param where where
     * @param col 컬럼
     * @param inparams Array 형태의 파라미터
     **/
    async searchWhereAndWhereIn(where, col, inparams): Promise<any> {
        return await this.dao.searchWhereAndWhereIn(where, col, inparams);
    };

    /**
     * LIST 조회 함수 Null 참고
     * @param where where
     * @param isNull 컬럼
     **/
    async searchIncludeIsNull(where, isNull): Promise<any> {
        return await this.dao.searchIncludeIsNull(where, isNull);
    }

    /**
     * 소팅 하여 단일 조회 함수
     * @param where where
     * @param column 컬럼
     * @param desc 순서
     **/
    async searchSortOne(where, column, desc): Promise<any> {
        return (await this.dao.searchSortOne(where, column, desc))[0];
    }

}

export {Repository};