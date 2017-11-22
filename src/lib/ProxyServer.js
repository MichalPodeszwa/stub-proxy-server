import express from 'express';
import http from 'http';
import methods from 'methods';
import proxy from 'express-http-proxy';
import detect from 'detect-port-alt';

export class ProxyServer {
    constructor (proxyAddress, defaultPort = 5000) {
        this.isListening = false;
        this.server = null;
        this._proxyMiddleware = proxy(proxyAddress);
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

        this._detectPort(defaultPort);
    }

    _detectPort (defaultPort) { 
        this._port = detect(defaultPort);
    }

    _createExpressApp () {
        const expressApp = express();
        
        for (const mock of this._mocks) {
            expressApp[mock.method](mock.route, mock.callback);
        }
        expressApp.use('/', this._proxyMiddleware);

        return expressApp
    }

    get port () {
        return this._port;
    }

    async listen () {
        if (this.isListening) {
            await this.stopListening()
        }

        this.server = http.createServer(this._createExpressApp());
        const port = await this.port;

        return new Promise(resolve => {
            this.server.listen(port, () => {
                this.isListening = true;
                resolve(this);
            });
        });
    }

    async stopListening () {
        return new Promise(resolve => {
            this.server.close(() => {
                resolve();
            });
        }) 
    }
}