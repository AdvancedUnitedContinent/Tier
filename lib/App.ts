import {MainnetRouter} from './mainnet/routes/MainnetRouter';
import {MainnetWalletOverridenFunctions, TokenWalletOverridenFunctions} from "./index";
import {MainnetDepositCheckCron} from "./mainnet/cron/MainnetDepositCheckCron";
import {MainnetGatheringCron} from "./mainnet/cron/MainnetGatheringCron";
import {MainnetTransactionMonitorCron} from "./mainnet/cron/MainnetTransactionMonitorCron";
import {TokenRouter} from './token/routes/TokenRouter';
import {TokenTransactionMonitorCron} from "./token/cron/TokenTransactionMonitorCron";
import {TokenDepositCheckCron} from "./token/cron/TokenDepositCheckCron";
import {TokenGatheringFeeSendCron} from "./token/cron/TokenGatheringFeeSendCron";
import {TokenGatheringCron} from "./token/cron/TokenGatheringCron";


/**
 * 시작 실행 을 주관하는 App class
 * Cron 등록 및 Router 등록
 **/
class App {

    walletOverridenFunctions: MainnetWalletOverridenFunctions;
    tokenWalletOverridenFunctions: TokenWalletOverridenFunctions;

    constructor(walletOverridenFunctions?: MainnetWalletOverridenFunctions, tokenWalletOverridenFunctions?: TokenWalletOverridenFunctions) {
        this.walletOverridenFunctions = walletOverridenFunctions;
        this.tokenWalletOverridenFunctions = tokenWalletOverridenFunctions;
    }

    importRoutes() {

        let that = this;

        let express = require('express');
        let path = require('path');
        let logger = require('morgan');
        let cookieParser = require('cookie-parser');
        let bodyParser = require('body-parser');


        let app = express();

        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));


        let routes;
        if (that.walletOverridenFunctions) {
            routes = new MainnetRouter(that.walletOverridenFunctions).getRouter();
        } else {
            routes = new TokenRouter(that.tokenWalletOverridenFunctions).getRouter();
        }

        app.use('/', routes);

        // error handler
        app.use(function (err, req, res, next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });

        return app;
    }

    registerCron() {

        let that = this;

        if (that.walletOverridenFunctions) {

            // 입금 내역 CRON 등록
            new MainnetDepositCheckCron(that.walletOverridenFunctions).initializeCron();


            // Gathering CRON 등록
            MainnetGatheringCron.getInstance(that.walletOverridenFunctions).initializeCron().then(function () {});

            // Transaction Monitor CRON 등록
            new MainnetTransactionMonitorCron(that.walletOverridenFunctions).startCron();


        } else {

            if (that.tokenWalletOverridenFunctions.config.needSendGatheringFee) {
                // 게더링 Fee 발송 CRON 등록
                TokenGatheringCron.getInstance(that.tokenWalletOverridenFunctions).initializeCron().then(function () {
                });
            }

            // 게더링 Fee 발송 CRON 등록
            TokenGatheringFeeSendCron.getInstance(that.tokenWalletOverridenFunctions).startCron();

            // 입금 내역 CRON 등록
            new TokenDepositCheckCron(that.tokenWalletOverridenFunctions).initializeCron();

            // Transaction Monitor CRON 등록
            new TokenTransactionMonitorCron(that.tokenWalletOverridenFunctions).startCron();
        }
    }
}

export {App}