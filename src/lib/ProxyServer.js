import express from 'express';
import http from 'http';
import methods from 'methods';
import proxy from 'express-http-proxy';

export class ProxyServer {
    constructor (port, proxyAddress) {
        this.isListening = false;
        this.server = null;
        this._proxyMiddleware = proxy(proxyAddress);
        this._port = port;
        this._mocks = [];

        for (let method of methods) {
            this[method] = (route, callback) => {
                this._mocks.push({method, route, callback});
                if (this.isListening) {
                    return this.listen();
                }
                return this;
            }
        }
    }

    async listen () {
        if (this.isListening) {
            this.stopListening()
            .then(() => {
            });
        }
        const expressApp = express();

        for (const mock of this._mocks) {
            expressApp[mock.method](mock.route, mock.callback);
        }
        expressApp.use('/', this._proxyMiddleware);
        this.server = http.createServer(expressApp);

        return new Promise(resolve => {
            this.server.listen(this._port, () => {
                this.isListening = true;
                resolve(this);
            });
        });
    }

    stopListening () {
        return new Promise(resolve => {
            this.server.close(() => {
                resolve();
            });
        }) 
    }
}