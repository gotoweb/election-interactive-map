window.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

var connect = require('connect');
var serveStatic = require('serve-static');

function runServer(port) {
    var app = connect().use(serveStatic(__dirname + '/..')).listen(port, function(){
        // console.log('Server running on ' + port + '...');
    });    

    var XHR_ENABLED = false;
    try {
        new XMLHttpRequest();
        XHR_ENABLED = true;
    } catch (e) {} // safari, ie    

    return {
        close: app.close.bind(app)
    }
}


module.exports = runServer;