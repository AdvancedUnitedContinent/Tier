import {MainnetWalletOverridenFunctions, TokenWalletOverridenFunctions} from "./index";
import {App} from "./App";
import http from "http";
import {LoggerUtil} from "./utils/Logger";
const logger = LoggerUtil.getInstance().logger;//로깅

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error, port) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

class Express {

    walletOverridenFunctions: MainnetWalletOverridenFunctions;
    tokenWalletOverridenFunctions: TokenWalletOverridenFunctions;

    constructor(walletOverridenFunctions?: MainnetWalletOverridenFunctions, tokenWalletOverridenFunctions?: TokenWalletOverridenFunctions) {
        this.walletOverridenFunctions = walletOverridenFunctions;
        this.tokenWalletOverridenFunctions = tokenWalletOverridenFunctions;
    }


    startExpress = function (port: number): void {

        let that = this;

        /**
         * Module dependencies.
         */
        let http = require('http');

        /**
         * Get port from environment and store in Express.
         */

            // DB 조회로 확인
        let serverPort = normalizePort(process.env.PORT || port);


        let app = new App(that.walletOverridenFunctions, that.tokenWalletOverridenFunctions);

        // Cron 등록
        app.registerCron();

        try {
            let router = app.importRoutes();
            router.set('port', serverPort);

            /**
             * Create HTTP server.1
             */

            let server = http.createServer(router);

            /**
             * Listen on provided port, on all network interfaces.
             */

            server.listen(serverPort);
            server.on('error', onError);
            server.on('listening', function () {
                logger.info("listening port ");
                server.address()
            });
        } catch (e) {
            logger.error(e);
        }
    }

}

export {Express}