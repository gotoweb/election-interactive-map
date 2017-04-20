var util = require('../dist/bundle').default.util;

test('indexOfMax blank', () => {
    expect(util.indexOfMax([])).toBe(-1);
});

test('indexOfMax', () => {
    expect(util.indexOfMax([1,3,5,2])).toBe(2);
    expect(util.indexOfMax([1,3,5,7])).toBe(3);
    expect(util.indexOfMax([1])).toBe(0);
});