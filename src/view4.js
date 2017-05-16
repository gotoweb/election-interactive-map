var resource = require('../dist/bundle').default.resource;
var util = require('../dist/bundle').default.util;
var Papa = require('papaparse');
var d3 = require('d3');
var Timer = require('../dist/bundle').default.Timer;

var chunkSize = 1024 * 1024 * 1; // 1MB

var f = d3.timeParse("%Y%m%d%H%M");
var step = 0;
var lastKey = '201212191840';
var cut = '';
var streamer, timer, keys, map, cache, offset;

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
        var str = JSON.stringify(contents);
        
        console.log( getKey(value), str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
    }

    return getKey(value);
}

function init(options) {
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

            if(step == 0) {
                console.warn(step)
                timer = new Timer({
                    limit: 645,
                    _speed: 100,
                    onTick: trigger
                });
            }
            else if(typeof options.conditions === 'function') {
                options.conditions(step, timer, getKey, map, keys);
            }
            else {
                options.done();
            }
        }
    });
}

function setProgress(value) {
    console.warn('setProgress');
    var current = trigger(value);
    
    timer.pause();
    timer.tickValue = value;
    timer.resume();

    return current;
}

module.exports = {
    getKey: getKey,
    trimFromWholeCountry: trimFromWholeCountry,
    init: init,
    setProgress: setProgress
}