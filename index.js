import render from "./src/render";
import resource from "./src/resource";
import util from "./src/util";
import el from "./src/el";
import * as topojson from 'topojson-client';
import * as d3 from 'd3';

resource.loadAll().then(function(all) {
    console.log(all);
});

const bundle = {
    render: render,
    resource: resource,
    util: util,
    topojson: topojson,
    _: el
};

window.bundle = bundle;

export default bundle;