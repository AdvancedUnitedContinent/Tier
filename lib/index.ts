import {WTokenConstant} from "./token/constant/WTokenConstant";
import {wFixUserWalletDao} from './dao/wallet/WFixUserWalletDao';
import {wWalletInfoDao} from './dao/wallet/WWalletInfoDao';
import {wUserWalletDao} from './dao/wallet/WUserWalletDao';
import {wCoinDao} from './dao/wallet/WCoinDao';
import {wWithdrawWalletDao} from './dao/wallet/WWithdrawWalletDao';

let {Express} = require('./Express');
let {WCoinConstant} = require('./mainnet/constant/WCoinConstant');
let {encrypt, decrypt} = require('./utils/AES256Cipher');


/**
 * 메인넷 지갑 개발 시 사용하는 Config Class
 **/
class MainnetWalletConfig {
    symbol: string;                         // 코인 심볼
    serviceKey: string;                     // 서비스 Key
    nonceCheck: boolean;                    // 출금 시 Nonce 체크 여부 (Ex : ETH = true)
    coldWalletAddresses: string[];          // 콜드 지갑 주소
    notGatheringDepositAmount: number = 0;  // 입금 시 수집하지 않을 금액
    withdrawBuffer: number;                 // 출금 시 버퍼 (Ex : ETH = 0.0001 이면 0.0001 잔금 이상 출금 시 출금 요청 X)
    gatheringBuffer: number;                // 집금 시 버퍼 (Ex : ETH = 0.0001 이면 0.0001 잔금 이상 집금 시 집금 요청 X)
    depositCheckCron: string;               // 입금 체크 크론 (Ex : 0 * * * * * = 1분마다)
    depositBlockCount: number;              // 입금 읽는 Block Count
    walletInfoName: string;                 // wallet.w_wallet_info DB  에 저장되어 있는 지갑 이름
    checkFoundationDeposit: boolean;        // 재단 입금 체크 여부 (모르는 지갑으로 부터 핫 / 콜드 입금 시 정산을 위해 DB 저장)
    checkCashOut?: boolean = false;         // 캐시아웃 자동으로 체크 여부
    useSecondAddress: boolean;              // 2차 지갑 주소 사용 여부 (Ex : XRP = true)
    loggerPath: string;                     // 로그 경로
}

/**
 * 메인넷 지갑 개발시 DB 읽어서 사용
 **/
class MainnetDatabaseSearchConfig {
    coinKey: number;            // 코인 키
    walletAddressType: string;  // 지갑 주소 타입
    coinFlag: number;           // 코인 플래그
}

/**
 * 토큰 지갑 개발 시 사용하는 Config Class
 **/
class TokenWalletConfig {
    serviceKey: string;                     // 서비스 Key
    walletAddressType: string;              // 지갑 주소 타입
    nonceCheck: boolean;                    // 출금 시 Nonce 체크 여부 (Ex : ERC20 = true)
    coldWalletAddresses: string[];          // 콜드 지갑 주소
    feeCoinSymbol: string;                  // 수수료 코인 심볼 (Ex : ERC20 = ETH)
    withdrawBuffer: number;                 // 출금 시 버퍼 (Ex : ETH = 0.0001 이면 0.0001 잔금 이상 출금 시 출금 요청 X)
    gatheringBuffer: number;                // 집금 시 버퍼 (Ex : ETH = 0.0001 이면 0.0001 잔금 이상 집금 시 집금 요청 X)
    depositCheckCron: string;               // 입금 체크 크론 (Ex : 0 * * * * * = 1분마다)
    depositBlockCount: number;              // 입금 읽는 Block Count
    walletInfoName: string;                 // wallet.w_wallet_info DB  에 저장되어 있는 지갑 이름
    checkFoundationDeposit: boolean;        // 재단 입금 체크 여부 (모르는 지갑으로 부터 핫 / 콜드 입금 시 정산을 위해 DB 저장)
    checkCashOut?: boolean = false;         // CASH OUT 체크 여부
    needSendGatheringFee?: boolean = true;  // 집금 시 수수료 전송 여부 (Ex : ERC20 = true)
    loggerPath: string;                     // 로그 경로
}

/**
 * 지갑 주소 생성 Result Class
 **/
class RequestCreateAddressResult {
    address: string;
    privateKey: string;
    secondaryAddress?: string;
}

/**
 * Transaction 조회 Result Class
 **/
class GetTransactionResult {
    networkFee: number;
    blockNumber: number;
    blockHash: string;
}

/**
 * Block 조회 Result Class
 **/
class GetBockInfoResult {
    blockTime: Date;
    blockNumber: number;
    blockHash: string;
}

/**
 * 입금 조회 시 Block 읽고 나온 Result Class
 **/
class GetDepositTransactionListFromBlock {
    blockTime: Date;
    blockNumber: number;
    blockHash: string;
    from: string;
    to: string;
    amount: number;
    txHash: string;
    secondAddress?: string;
}

/**
 * 출금 신청 완료 후 Result Class
 **/
class RequestWithdrawResult {
    txHash: string;
    nonce: number;
}

/**
 * 집금 신청 완료 후 Result Class
 **/
class RequestGatheringResult {
    txHash: string;
    nonce: number;
}

/**
 * Mainnet Wallet Interface
 * 메인넷 지갑 개발 시 반드시 구현해야 하는 공통 모듈
 * 아래는 실행 예제
 * EX) await new WalletCommon(walletOverridenFunctions).startExpress(port, symbol);
 **/
class MainnetWalletCommon {

    walletOverridenFunctions: MainnetWalletOverridenFunctions;

    constructor(walletOverridenFunctions: MainnetWalletOverridenFunctions) {

        this.walletOverridenFunctions = walletOverridenFunctions;

    }

    startExpress = async function (port: number, symbol: string): Promise<void> {

        let that = this;

        let coinKey = (await WCoinConstant.getInstance(symbol)).getCoinKey();
        let coinFlag = (await WCoinConstant.getInstance(symbol)).getCoinFlag();
        let walletAddressType = (await WCoinConstant.getInstance(symbol)).getWalletAddressType();

        console.log(`coinKey ${coinKey}`);
        console.log(`coinFlag ${coinFlag}`);
        console.log(`walletAddressType ${walletAddressType}`);

        that.walletOverridenFunctions.dbSearchConfig = {
            coinKey: coinKey,
            walletAddressType: walletAddressType,
            coinFlag: coinFlag
        };

        let express = new Express(that.walletOverridenFunctions);
        express.startExpress(port);

    };

}

/**
 * Token Wallet Interface
 * 토큰 지갑 개발 시 반드시 구현해야 하는 공통 모듈
 * 아래는 실행 예제
 * EX) await new TokenWalletCommon(tokenWalletOverridenFunctions).startExpress(port);
 **/
class TokenWalletCommon {

    tokenWalletOverridenFunctions: TokenWalletOverridenFunctions;

    constructor(tokenWalletOverridenFunctions: TokenWalletOverridenFunctions) {

        this.tokenWalletOverridenFunctions = tokenWalletOverridenFunctions;

        console.log("TokenWalletCommon constructor");
    }

    startExpress = async function (port: number): Promise<void> {

        let that = this;

        let express = new Express(null, that.tokenWalletOverridenFunctions);

        (await WTokenConstant.getInstance(that.tokenWalletOverridenFunctions.config.walletInfoName));

        express.startExpress(port);

    };

}


/**
 * 메인넷 지갑 개발 시 반드시 구현해야 하는 Interface
 **/
class MainnetWalletOverridenFunctions {

    config: MainnetWalletConfig;
    dbSearchConfig?: MainnetDatabaseSearchConfig;
    options?;

    // 지갑 유효성 체크 함수
    checkAddress: (address: string) => Promise<boolean>;

    // 지갑 생성 함수
    requestCreateAddress: (uuid) => Promise<RequestCreateAddressResult>;

    // Block Number 정보 조회 함수
    getBlockNumber: () => Promise<number>;

    // Transaction 정보 조회 함수
    getTransaction: (txHash: string) => Promise<GetTransactionResult>;

    // Block 정보 조회 함수
    getBlockInfo: (blockNumber: number, blockHash: string) => Promise<GetBockInfoResult>

    // Block 내에 Transaction 이 있는지 확인
    getDepositTransactionListFromBlock: (startBlockNumber: number, endBlockNumber: number) => Promise<GetDepositTransactionListFromBlock[]>

    // 출금 요청
    requestWithdraw: (withdrawAddress: string, requestAddress: string, amount: number, privateKey: string, secondaryRequestAddress?: string) => Promise<RequestWithdrawResult>

    // 집금 요청
    requestGathering: (userAddress: string, gatheringAddress: string, privateKey: string) => Promise<RequestGatheringResult>

    // 잔액 조회
    getBalance: (address: string) => Promise<number>

    // Nonce 체크 (ETH 계열 사용)
    getNonce: (address: string) => Promise<number>

    // Wallet Import
    walletImport?: (address: string, privateKey: string) => Promise<void>

    constructor(
        config: MainnetWalletConfig,
        options: { schema: any },
        requestCreateAddress: (uuid: string) => Promise<RequestCreateAddressResult>,
        checkAddress: (address: string) => Promise<boolean>,
        getBlockNumber: () => Promise<number>,
        getTransaction: (txHash: string) => Promise<GetTransactionResult>,
        getBlockInfo: (blockNumber: number, blockHash: string) => Promise<GetBockInfoResult>,
        getDepositTransactionListFromBlock: (startBlockNumber: number, endBlockNumber: number) => Promise<GetDepositTransactionListFromBlock[]>,
        requestWithdraw: (withdrawAddress: string, requestAddress: string, amount: number, privateKey: string, secondaryRequestAddress?: string) => Promise<RequestWithdrawResult>,
        requestGathering: (userAddress: string, gatheringAddress: string, privateKey: string) => Promise<RequestGatheringResult>,
        getBalance: (address: string) => Promise<number>,
        getNonce: (address: string) => Promise<number>,
        walletImport?: (address: string, privateKey: string) => Promise<void>
    ) {
        this.config = config;
        this.options = options;

        // 주소 체크
        this.checkAddress = checkAddress;

        // 주소 생성
        this.requestCreateAddress = requestCreateAddress;
        this.getBlockNumber = getBlockNumber;
        this.getTransaction = getTransaction;
        this.getBlockInfo = getBlockInfo;
        this.getDepositTransactionListFromBlock = getDepositTransactionListFromBlock;
        this.requestWithdraw = requestWithdraw;
        this.requestGathering = requestGathering;
        this.getBalance = getBalance;
        this.getNonce = getNonce;
        this.walletImport = walletImport;
    }
}

/**
 * Token Wallet Interface
 * 토큰 지갑 개발 시 반드시 구현해야 하는 Interface
 **/
class TokenWalletOverridenFunctions {

    config: TokenWalletConfig;
    options;

    // 지갑 유효성 체크 함수
    checkAddress: (address: string) => Promise<boolean>;

    // 지갑 생성 함수
    // Block Number 정보 조회 함수
    getBlockNumber: () => Promise<number>;

    // Transaction 정보 조회 함수
    getTransaction: (txHash: string) => Promise<GetTransactionResult>;

    // Block 정보 조회 함수
    getBlockInfo: (blockNumber: number, blockHash: string) => Promise<GetBockInfoResult>

    // Block 내에 Transaction 이 있는지 확인
    getDepositTransactionListFromBlock: (contractAddress: string, startBlockNumber: number, endBlockNumber: number) => Promise<GetDepositTransactionListFromBlock[]>

    // 집금 위해서 메인넷 코인 수량 출금 요청
    sendGatheringFee: (withdrawAddress: string, requestAddress: string, amount: number, privateKey: string) => Promise<RequestWithdrawResult>

    // 출금 요청
    requestWithdraw: (contractAddress: string, withdrawAddress: string, requestAddress: string, amount: number, privateKey: string) => Promise<RequestWithdrawResult>

    // 집금 요청
    requestGathering: (contractAddress: string, userAddress: string, gatheringAddress: string, privateKey: string, feePayerPk?: string) => Promise<RequestGatheringResult>

    // 잔액 조회
    getTokenBalance: (contractAddress: string, address: string) => Promise<number>

    // 메인넷 잔액 조회
    getMainNetBalance: (address: string) => Promise<number>

    // Nonce 체크 (ETH 계열 사용)
    getNonce?: (address: string) => Promise<number>

    constructor(
        config: TokenWalletConfig,
        options: { schema: any },
        checkAddress: (address: string) => Promise<boolean>,
        getBlockNumber: () => Promise<number>,
        getTransaction: (txHash: string) => Promise<GetTransactionResult>,
        getBlockInfo: (blockNumber: number, blockHash: string) => Promise<GetBockInfoResult>,
        getDepositTransactionListFromBlock: (contractAddress: string, startBlockNumber: number, endBlockNumber: number) => Promise<GetDepositTransactionListFromBlock[]>,
        sendGatheringFee: (withdrawAddress: string, requestAddress: string, amount: number, privateKey: string) => Promise<RequestWithdrawResult>,
        requestWithdraw: (contractAddress: string, withdrawAddress: string, requestAddress: string, amount: number, privateKey: string, secondaryRequestAddress?: string) => Promise<RequestWithdrawResult>,
        requestGathering: (contractAddress: string, userAddress: string, gatheringAddress: string, privateKey: string, feePayerPk?: string) => Promise<RequestGatheringResult>,
        getTokenBalance: (contractAddress: string, address: string) => Promise<number>,
        getMainNetBalance: (address: string) => Promise<number>,
        getNonce?: (address: string) => Promise<number>
    ) {
        this.config = config;
        this.options = options;

        // 주소 체크
        this.checkAddress = checkAddress;

        this.getBlockNumber = getBlockNumber;
        this.getTransaction = getTransaction;
        this.getBlockInfo = getBlockInfo;
        this.getDepositTransactionListFromBlock = getDepositTransactionListFromBlock;
        this.sendGatheringFee = sendGatheringFee;
        this.requestWithdraw = requestWithdraw;
        this.requestGathering = requestGathering;
        this.getTokenBalance = getTokenBalance;
        this.getMainNetBalance = getMainNetBalance;
        this.getNonce = getNonce;
    }
}

export {
    MainnetWalletCommon,
    MainnetWalletOverridenFunctions,
    TokenWalletCommon,
    TokenWalletOverridenFunctions,
    MainnetWalletConfig,
    GetTransactionResult,
    GetBockInfoResult,
    RequestWithdrawResult,
    RequestCreateAddressResult,
    RequestGatheringResult,
    GetDepositTransactionListFromBlock,
    wFixUserWalletDao,
    wWalletInfoDao,
    wUserWalletDao,
    wCoinDao,
    wWithdrawWalletDao,
    encrypt,
    decrypt
};
