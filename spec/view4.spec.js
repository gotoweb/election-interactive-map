var spec = require('./view4.spec.fn');

var util = require('../dist/bundle').default.util;

var port = util.getRandomPort();
var server = require('./test_server')(port);
window.localhost = 'http://localhost:' + port + '/';

test('맵 잘 묶나 확인', spec.test1_map);

test('순서대로 떨어지는가 확인', spec.test2_sequence);

test('퍼센트 테스트', spec.test4);

test('시간 더하기', spec.test5);

test('연속적 로딩', spec.test6);

test('특정 위치에서 로딩', spec.test7);

test('테스트 끝', () => {
    server.close();
})