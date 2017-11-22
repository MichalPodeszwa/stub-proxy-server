'use strict';

const express = require('express');
const http = require('http');
const methods = require('methods');
const proxy = require('express-http-proxy');
const detect = require('detect-port-alt');

class ProxyServer {
    constructor (proxyAddress, defaultPort) {
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

        this._detectPort(defaultPort || 5000);
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

    getPort () {
        return this._port;
    }

    listen () {
        let listenPromise = Promise.resolve();
        if (this.isListening) {
            listenPromise = listenPromise.then(() => this.stopListening())
        }

        this.server = http.createServer(this._createExpressApp());
        
        
        return listenPromise
            .then(() => this.getPort())
            .then(port => {
                return new Promise(resolve => {
                    this.server.listen(port, () => {
                        this.isListening = true;
                        resolve(this);
                    });
                });
            })
    }

    stopListening () {
        return new Promise(resolve => {
            this.server.close(() => {
                resolve();
            });
        }) 
    }
}

module.exports = ProxyServer;