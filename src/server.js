import {ProxyServer} from './lib/ProxyServer';


const proxyServer = new ProxyServer('example.com', 5000);

proxyServer.listen()
    .then(async proxyApp => {
        console.log(`listening on ${await proxyApp.port}`);
        await proxyApp.get('/bar/:name', (req, res, next) => {
            res.json({bar: req.params.name});
        });
        await proxyApp.get('/baz/:name', (req, res, next) => {
            res.json({baz: req.params.name});
        });
    })