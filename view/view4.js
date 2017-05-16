import resource from '../src/resource';
import util from '../src/util';
import Papa from 'papaparse';

window.localhost = '../';
import spec from '../spec/view4.spec.fn';

function stream() {
    spec.test7(() => {
        console.log('done');
    });
}

stream();