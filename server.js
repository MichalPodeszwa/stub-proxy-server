const ProxyServer = require('./lib');


function runServer () {
    const proxyServer = new ProxyServer('example.com', 5000);
    
    Promise
        .resolve()
        .then(() => 
            proxyServer.get('/bar/:name', (req, res, next) => {
                res.json({bar: req.params.name});
            })
        )
        .then(() => 
            proxyServer.get('/baz/:name', (req, res, next) => {
                res.json({baz: req.params.name});
            })
        )
        .then(() => proxyServer.listen())
        .then(() => proxyServer.getPort())
        .then(port => console.log("listening on " + port));
}

runServer();