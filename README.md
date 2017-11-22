# Stub-Proxy-Server

## Description

This package allows you to stub endpoints of a server while still keeping the rest of the routes proxied.

An example use-case would be a lot easier edge-case handling in end-to-end tests.

## Usage

``` js
const ProxyServer = require('./lib');


function runServer () {
    // Set example.com as the default proxy endpoint, and default port (if it's taken, it'll search for other available port)
    const proxyServer = new ProxyServer('example.com', 5000);
    
    Promise
        .resolve()
        .then(() => 
            // stub routes matching /bar/:name.
            proxyServer.get('/bar/:name', (req, res, next) => {
                res.json({bar: req.params.name});
            })
        )
        .then(() => proxyServer.listen())
        .then(() => proxyServer.getPort())
        .then(port => console.log("listening on " + port))
        .then(() => 
            // You can also stub routes after the application started listening. The server will restart, but the port will not be changed.
            proxyServer.get('/baz/:name', (req, res, next) => {
                res.json({baz: req.params.name});
            })
        );
}

runServer();
```

`ProxyServer` has the same API for method matching as `express.js`.

All the methods return a promise, since some of the calls will require the server to restart. The promise will resolve after the server has started. `async/await` is also supported.

