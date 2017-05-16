var render = require('../dist/bundle').default.render;
var jsdom = require('jsdom');
var d3 = require('d3');


test('render as...', () => {
    expect(typeof render.asTable).toEqual('function');
    expect(typeof render.asMap).toEqual('function');
});

test('asTable', (done) => {

    var data = [{
        properties: {
            hello: 'world'
        }
    }];

    var window = jsdom.env('<div id="cont"></div>', {
        features : {
            QuerySelector : true
        }
    }, {
        done: (err, window) => {
            
            var el = window.document.querySelector('#cont');
            var ret = render.asTable(data, el);

            expect(ret.constructor.name).toEqual('Selection');
            expect(el.outerHTML).toMatch(/^<div id=\"cont\"><table>/g);

            // console.log(el.outerHTML)

            done();
        }
    })

    expect('<table></table>').toMatch(/^<table>/g);
});


test('asMap', (done) => {

    var data = [{
        properties: {
            hello: 'world',
            election: {
                '유력후보': 1
            }
        }
    }];

    var window = jsdom.env('<div id="cont"></div>', {
        features : {
            QuerySelector : true
        }
    }, {
        done: (err, window) => {
            
            var el = window.document.querySelector('#cont');
            var ret = render.asMap(data, el);

            expect(ret.constructor.name).toEqual('Selection');
            expect(el.outerHTML).toMatch(/^<div id=\"cont\"><svg/g)

            // console.log(el.outerHTML)

            done();
        }
    });
});