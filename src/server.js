import {ProxyServer} from './lib/ProxyServer';


const proxyServer = new ProxyServer(5000, 'example.com');

proxyServer.listen()
    .then(async proxyApp => {
        console.log('listening on 5000');
        await proxyApp.get('/bar/:name', (req, res, next) => {
            res.json({bar: req.params.name});
        });
        await proxyApp.get('/baz/:name', (req, res, next) => {
            res.json({baz: req.params.name});
        });
    })