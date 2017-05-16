var resource = require('../dist/bundle').default.resource;
var util = require('../dist/bundle').default.util;

var port = util.getRandomPort();
var server = require('./test_server')(port);
var localhost = 'http://localhost:' + port + '/';

test('xhr', (done) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', localhost + 'resources/popong-dup.json', true);
    xhr.onload = () => {
        expect(xhr.responseText.length > 0).toEqual(true);
        done();
    }
    xhr.send();
});

test('NetworkStreamer', (done) => {
    expect(typeof resource.NetworkStreamer).toEqual('function');
    var streamer = new resource.NetworkStreamer({
        url: localhost + 'resources/1min.csv',
        onLoaded: function(resp) {
            expect(streamer.fileSize).toEqual(16366883);
            expect(resp).toMatch(/제공일시\,시도명\,위원회명\,개표완료된선거인수\,투표수\,무효투표수/g);
            done();
        }
    });
    
});


test('all done', () => {
    server.close();
})