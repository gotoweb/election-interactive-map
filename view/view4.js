import resource from '../src/resource';
import util from '../src/util';
import Papa from 'papaparse';

window.localhost = '../';
// import spec from '../spec/view4.spec.fn';
import view4 from '../src/view4';

function done() {
    console.warn('done');
}

function spec5() {
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
            }
        }
    });

}

function spec6() {
    view4.init({
        done: done
    });
    
    setTimeout(function() {
        view4.setProgress(30);
    }, 1000);
}

spec6();

// spec5();