var render = require('../dist/bundle').default.render;

describe('has function?', function() {
    it('render as...', function() {
        expect(typeof render.asTable).toEqual('function');
        expect(typeof render.asMap).toEqual('function');
    });
});