var resource = require('../dist/bundle').default.resource;
var util = require('../dist/bundle').default.util;
var Papa = require('papaparse');
var d3 = require('d3');
var Timer = require('../dist/bundle').default.Timer;

var chunkSize = 1024 * 1024 * 1; // 1MB
// var SPEED = 20;
var SPEED = 500;
var f = d3.timeParse("%Y%m%d%H%M");

var step, lastKey, cut, streamer, timer, keys, map, cache, offset, renderer, isInit = true;

function clear() {
    step = 0;
    lastKey = '201212191840';
    cut = '';
    streamer = undefined;
    timer = undefined;
    keys = undefined;
    map = undefined;
    cache = undefined;
    offset = undefined;
    renderer = undefined;    
    isInit = true;
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



function getKey(value) {
    var start = f("201212191840");
    start.setMinutes(start.getMinutes() + value);
    var key = d3.timeFormat("%Y%m%d%H%M")(start);
    return key;
}

function isNeedToLoad(key) {
    if (keys.indexOf(key) == -1) {
        return true;
    }
    else {
        return false;
    }
}            

function trigger(value) {
    var needs = isNeedToLoad( getKey(value) );
    if(needs) {
        console.log('-------', step, value, getKey(value), offset);
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

        timer.pause();
        console.warn(step);
    }
    else {
        var contents = map[ getKey(value) ];

        render(getKey(value), contents, value);

        // var str = JSON.stringify(contents);
        // console.log( getKey(value), str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
    }

    return {
        isNeedToLoad: needs,
        key: getKey(value)
    }
}

function render(key, contents, value) {
    if(typeof renderer === 'function') {
        renderer(key, contents, value);
    }   
}

function init(options) {
    clear();
    renderer = options.renderer;
    streamer = new resource.NetworkStreamer({
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

            if(step == 0 && isInit) {
                console.warn(step)
                timer = new Timer({
                    limit: 645,
                    _speed: SPEED,
                    onTick: trigger,
                    onLast: function() {
                        options.done();
                    }
                });
                isInit = false;
            }
            else if(typeof options.conditions === 'function') {
                options.conditions(step, timer, getKey, map, keys);
            }
            // else if(step == 15) {
                // 15번째가 마지막이 맞지만, 만일 done 해버린다면 타이머가 돌아가지 않을 것이다.
                // options.done();
            // }
            else {
                timer.tickValue = timer.tickValue - 1;

                // 연속된 경우가 아니고, 점프한 경우에는 없다.
                if(!!map[ getKey(timer.tickValue) ]) {
                    console.log('continue 2..')
                    render(getKey(timer.tickValue), map[ getKey(timer.tickValue) ], timer.tickValue);
                }
                timer.resume();
            }
        }
    });
}

function setProgress(value) {
    
    var current = trigger(parseInt(value));
    console.warn(getKey(value), current.isNeedToLoad);
    
    if(!current.isNeedToLoad) {
        timer.pause();
        timer.tickValue = value;
        timer.resume();
        console.log('로드필요없음')
    }
    else {
        // step = Math.floor(value / 50) - 1;  // 얼추 로딩을 건너뛰어 보려 했으나, contents 길이가 제각각이라 정확히 알 수 없다.
        step = Math.max( Math.floor(value / 50) - 2, -1 );  // 이전 값으로 돌릴려면 필요하네
        timer.tickValue = value;
        console.log('로드필요함')
    }
    
    return current;
}

module.exports = {
    getKey: getKey,
    trimFromWholeCountry: trimFromWholeCountry,
    init: init,
    setProgress: setProgress
}