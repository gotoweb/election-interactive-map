var resource = require('../dist/bundle').default.resource;
var util = require('../dist/bundle').default.util;
var Papa = require('papaparse');
var d3 = require('d3');
var Timer = require('../dist/bundle').default.Timer;

var chunkSize = 1024 * 1024 * 1; // 1MB

if(typeof expect != 'function') {
    window.expect = function() {
        return {
            toEqual: function() {

            }
        }
    }
}

function trimFromWholeCountry(json) {
    var index = 0;
    for (; index < json.data.length; index++) {
        var element = json.data[index];
        if(element[1] == '전국') { // 새로운 timestamp는 전국 통계로부터 시작된다.
            break;
        }
    }
    json.data.splice(0, index); // 이전 timestamp 정보 날려버림
    return json;
}

function test1_map() {

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
    json = trimFromWholeCountry(json);
    var map = util.getPriormap(json.data);
    expect(Object.keys(map).length).toEqual(3);

}

function test2_sequence(done) {
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

                /*
                // 다음 csv 가 valid 하면됨
                console.log(
                    resp.substr(0,
                        resp.indexOf(
                            parseInt(resp.substr(0,12)) + 1
                        ))
                    );
                    */
            }

            var json = Papa.parse(resp, {dynamicTyping: true});
            json = trimFromWholeCountry(json);
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
                // console.log(map[keys[keys.length - 1]]['제주특별자치도서귀포시'])

                // firstkey 완전체인 것 확인
                // console.log(keys[0], map[keys[0]]['전국']);

            }

        }
    });


}
//////////////

function test4() {
    function perc(value) {
        var max = 400;
        var getPercent = d3.scaleLinear().domain([0, max]).range([0, 100]);
        return getPercent(value);
    }

    expect(perc(20)).toEqual(5);
    expect(perc(40)).toEqual(10);
    expect(perc(60)).toEqual(15);
    expect(perc(400)).toEqual(100);

}

//////////////
var f = d3.timeParse("%Y%m%d%H%M");

function getKey(value) {
    var start = f("201212191840");
    start.setMinutes(start.getMinutes() + value);
    var key = d3.timeFormat("%Y%m%d%H%M")(start);
    return key;
}
//////////////

function test5() {

    expect(getKey(40)).toEqual('201212191920');
    expect(getKey(80)).toEqual('201212192000');
}


function test6(done) {
    var step = 0;
    var lastKey = '201212191840';
    var cut = '';
    var timer, keys, map, cache, offset;

    function isNeedToLoad(key) {
        if (keys.indexOf(key) == -1) {
            return true;
        }
        else {
            return false;
        }
    }            

    function trigger(value) {
        if(isNeedToLoad( getKey(value) )) {
            console.log('-------', step, value, getKey(value));
            // var offset = contlen;
            
            step++;
            streamer.readChunk(offset * step);
            lastKey = keys[keys.length - 1];
            // lastKey 는 내용이 짤리게 될 것이다.

            // cache 를 onLoaded scope 밖으로 안빼고 사용했더니,
            // 계속 최초의 resp를 할당하는 문제가 있었다
            // new Timer 할 때의 scope가 계속 남아있는 것
            cut = cache.substr(cache.indexOf(lastKey));

            // console.log(lastKey)
            // console.log( getKey(value), map[ getKey(value) ] );

            this.pause();
        }
        else {
            var contents = map[ getKey(value) ];

            expect(typeof contents).toEqual('object');
            var str = JSON.stringify(contents);
            
            console.log( getKey(value), str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }
    }

    var streamer = new resource.NetworkStreamer({
        url: window.localhost + 'resources/1min.csv',
        onLoaded: function (resp, contlen) {
            cache = resp;
            offset = contlen;

            if(cut.length > 0) {
                cache = cut + cache;
            }

            var json = Papa.parse(cache, {dynamicTyping: true});
            json = trimFromWholeCountry(json);
            map = util.getPriormap(json.data);

            var sliderValue = 0;

            keys = Object.keys(map);

            ////// 11번째는 csv 가 짤려서 들어온다
            if(step == 11) {
                delete map[keys[0]];
                keys = Object.keys(map);
                lastKey = keys[0];
            }


            if(step == 0) {
                console.warn(step)
                timer = new Timer({
                    limit: 645,
                    _speed: 100,
                    onTick: trigger
                });
            }
            else if(step == 1 || step == 2) {
                console.log('>>>>>>', timer.tickValue - 1, getKey(timer.tickValue - 1), map[getKey(timer.tickValue - 1)]);
                setTimeout(function() {
                    console.log('>>>>>>', timer.tickValue, getKey(timer.tickValue), map[getKey(timer.tickValue)]);
                    timer.resume();
                }, 1000);
            }
            else if(step == 3) {
                console.warn('done', step);
                // console.log(keys);
                done();
            }
        }
    });
}


function test7(done) {
    var step = 0;
    var lastKey = '201212191840';
    var cut = '';
    var timer, keys, map, cache, offset;

    function isNeedToLoad(key) {
        if (keys.indexOf(key) == -1) {
            return true;
        }
        else {
            return false;
        }
    }            

    function trigger(value) {
        if(isNeedToLoad( getKey(value) )) {
            console.log('-------', step, value, getKey(value));
            // var offset = contlen;
            
            step++;
            streamer.readChunk(offset * step);
            lastKey = keys[keys.length - 1];
            // lastKey 는 내용이 짤리게 될 것이다.

            // cache 를 onLoaded scope 밖으로 안빼고 사용했더니,
            // 계속 최초의 resp를 할당하는 문제가 있었다
            // new Timer 할 때의 scope가 계속 남아있는 것
            cut = cache.substr(cache.indexOf(lastKey));

            // console.log(lastKey)
            // console.log( getKey(value), map[ getKey(value) ] );

            this.pause();
        }
        else {
            var contents = map[ getKey(value) ];

            expect(typeof contents).toEqual('object');
            var str = JSON.stringify(contents);
            
            console.log( getKey(value), str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }

        return getKey(value);
    }

    var streamer = new resource.NetworkStreamer({
        url: window.localhost + 'resources/1min.csv',
        onLoaded: function (resp, contlen) {
            cache = resp;
            offset = contlen;

            if(cut.length > 0) {
                cache = cut + cache;
            }

            var json = Papa.parse(cache, {dynamicTyping: true});
            json = trimFromWholeCountry(json);
            map = util.getPriormap(json.data);

            var sliderValue = 0;

            keys = Object.keys(map);

            ////// 11번째는 csv 가 짤려서 들어온다
            if(step == 11) {
                delete map[keys[0]];
                keys = Object.keys(map);
                lastKey = keys[0];
            }


            if(step == 0) {
                console.warn(step)
                timer = new Timer({
                    limit: 645,
                    _speed: 100,
                    onTick: trigger
                });
            }
            else {
                done();
            }
        }
    });

    function setProgress(value) {
        console.warn('setProgress');
        var current = trigger(value);
        expect(current).toEqual('201212191910');
        timer.pause();
        timer.tickValue = value;
        timer.resume();
    }

    setTimeout(function() {
        setProgress(30);
    }, 1000);
}

module.exports = {
    test1_map: test1_map,
    test2_sequence: test2_sequence,
    test4: test4,
    test5: test5,
    test6: test6,
    test7: test7
};