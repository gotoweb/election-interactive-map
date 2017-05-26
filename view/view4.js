import resource from '../src/resource';
import util from '../src/util';
import Papa from 'papaparse';

window.localhost = '../';
import view4 from '../src/view4';

var $play = document.querySelector('#play');
var $progress = document.querySelector('#progress');
var $debug = document.querySelector('#debug');

var canrender = true;

$progress.addEventListener('change', function() {
    console.warn(';;;')
    view4.setProgress( this.value );
});

$progress.addEventListener('mousedown', function() {
    console.log('mousedown')
    canrender = false;
});

$progress.addEventListener('mouseup', function() {
    console.log('mouseup')
    canrender = true;
});

function start() {
    view4.init({
        done: done,
        renderer: function(key, contents, value) {
            if(canrender) {
                var str = JSON.stringify(contents);
                console.log(key, str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
                $debug.innerHTML = str;

                if(typeof value != 'number') {
                    debugger;
                }
                $progress.value = value;
            }
                
        }
    });
}

start();
// spec7();




function done() {
    console.warn('done');
}

function spec7() {
    view4.init({
        done: done,
        renderer: function(key, contents) {
            var str = JSON.stringify(contents);
            console.log(key, str.substr(0, 20), '...', str.substr(str.length - 30, 30) );
        }
    });
    setTimeout(function() {
        var current = view4.setProgress(20);

        // setTimeout(function() {
        //     var current = view4.setProgress(30);
        // }, 20000);
    }, 2000);
}