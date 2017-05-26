var resource = require('../dist/bundle').default.resource;
var util = require('../dist/bundle').default.util;
var Papa = require('papaparse');
var d3 = require('d3');

var port = util.getRandomPort();
var server = require('./test_server')(port);
window.localhost = 'http://localhost:' + port + '/';

var view4 = require('../src/view4.js');

if(typeof expect != 'function') {
    window.expect = function() {
        return {
            toEqual: function() {

            }
        }
    }
}

test('맵 잘 묶나 확인', function test1_map() {

    var csv = `제공일시,시도명,위원회명,개표완료된선거인수,투표수,무효투표수,새누리당박근혜,민주통합당문재인,무소속박종선,무소속김소연,무소속강지원,무소속김순자,계
201212191840,전국,,1262 ,965 ,2 ,794 ,165 ,0 ,0 ,2 ,2 ,963
201212191840,서울특별시,합계,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0
201212191840,서울특별시,종로구,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0
201212191841,전국,,1262 ,965 ,2 ,160 ,799 ,0 ,0 ,2 ,2 ,963
201212191841,서울특별시,용산구,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0
201212191842,전국,,1262 ,965 ,2 ,260 ,699 ,0 ,0 ,2 ,2 ,963
201212191842,서울특별시,광진구,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0
201212191842,서울특별시,동대문구,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0
201212191842,서울특별시,중랑구,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 `;

    var json = Papa.parse(csv, {dynamicTyping: true});
    json = view4.trimFromWholeCountry(json);
    var map = util.getPriormap(json.data);
    expect(Object.keys(map).length).toEqual(3);

});

test('퍼센트 테스트', function() {
    function perc(value) {
        var max = 400;
        var getPercent = d3.scaleLinear().domain([0, max]).range([0, 100]);
        return getPercent(value);
    }

    expect(perc(20)).toEqual(5);
    expect(perc(40)).toEqual(10);
    expect(perc(60)).toEqual(15);
    expect(perc(400)).toEqual(100);
});

test('시간 더하기', function() {
    expect(view4.getKey(40)).toEqual('201212191920');
    expect(view4.getKey(80)).toEqual('201212192000');
});

test('순서대로 떨어지는가 확인', function(done) {
    var step = 0;
    var lastKey = '201212191840';
    var cut = '';
    var streamer = new resource.NetworkStreamer({
        url: window.localhost + 'resources/1min.csv',
        onLoaded: function (resp, contlen) {

            // console.log(resp.length, contlen);

            if(cut.length > 0) {
                // console.log(cut.substr(0, 10))
                // var ress = resp.substr(0, resp.indexOf(parseInt(lastKey) + 1));
                resp = cut + resp;

                
                // 다음 csv 가 valid 하면됨
                // console.log(
                //     resp.substr(0,
                //         resp.indexOf(
                //             parseInt(resp.substr(0,12)) + 1
                //         ))
                //     );
                    
            }

            var json = Papa.parse(resp, {dynamicTyping: true});
            json = view4.trimFromWholeCountry(json);
            var map = util.getPriormap(json.data);


            var sliderValue = 0;


            var keys = Object.keys(map);

            ////// 11번째는 csv 가 짤려서 들어온다
            if(step == 11) {
                delete map[keys[0]];
                keys = Object.keys(map);
                lastKey = keys[0];
            }

            // console.log(step, '=====' , keys[0], keys[keys.length - 1], keys[keys.length - 1] - keys[0], lastKey);
            // console.log(keys);


            var offset = contlen;

            if(step == 15) {
                expect(parseInt(lastKey)).toEqual(parseInt(keys[0]));

                done();
            }
            else {
                expect(parseInt(lastKey)).toEqual(parseInt(keys[0]));

                step++;
                streamer.readChunk(offset * step);
                lastKey = keys[keys.length - 1];

                // lastKey 는 짤리게 될 것이다.

                cut = resp.substr(resp.indexOf(lastKey));

                // lastKey 짤리는 것 확인
                expect(map[keys[keys.length - 1]]['제주특별자치도서귀포시']).toBeUndefined();

                // firstkey 완전체인 것 확인
                expect(keys[0], map[keys[0]]['전국']).toBeDefined();

            }

        }
    });
});

test('연속적 로딩', function(done) {
    view4.init({
        done: done,
        conditions: function(step, timer, getKey, map) {
            if(step == 1 || step == 2) {
                console.log('>>>>>>', timer.tickValue - 1, getKey(timer.tickValue - 1), map[getKey(timer.tickValue - 1)]);
                setTimeout(function() {
                    console.log('>>>>>>', timer.tickValue, getKey(timer.tickValue), map[getKey(timer.tickValue)]);
                    timer.resume();
                }, 1000);
            }
            else if(step == 3) {
                console.warn('done', step);
                done();
            }
        },
        renderer: function(key, contents) {
            var str = JSON.stringify(contents);
            console.log(key, str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }
    });

});

test('특정 위치에서 로딩 1', function(done) {
    view4.init({
        done: done,
        conditions: function(step, timer, getKey, map) {
            if(step == 1 || step == 2) {
                timer.resume();
            }
            else if(step == 3) {
                done();
            }
        },
        renderer: function(key, contents) {
            var str = JSON.stringify(contents);
            console.log(key, str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }
    });
    setTimeout(function() {
        var current = view4.setProgress(30);
        expect(current.key).toEqual('201212191910');
    }, 1000);
});

test('특정 위치에서 로딩 2', function(done) {
    view4.init({
        done: done,
        conditions: function(step, timer, getKey, map) {
            if(step < 5) {
                timer.resume();
            }
            else if(step == 5) {
                done();
            }
        },
        renderer: function(key, contents) {
            var str = JSON.stringify(contents);
            console.log(key, str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }
    });
    setTimeout(function() {
        var current = view4.setProgress(200);
    }, 1000);
});
/*
test('이전 위치로 되돌아감', function(done) {
    view4.init({
        done: done,
        renderer: function(key, contents) {
            var str = JSON.stringify(contents);
            console.log(key, str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }
    });
    setTimeout(function() {
        var current = view4.setProgress(600);

        setTimeout(function() {
            var current = view4.setProgress(30);
        }, 2000);
    }, 1000);
});
*/
test('테스트 끝', () => {
    server.close();
})