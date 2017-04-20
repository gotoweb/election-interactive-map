import * as d3 from 'd3';

function loadAll() {
    return new Promise(function(resolve, reject) {
        var q = d3.queue();
        q.defer(d3.json, '/resources/popong-dup.json')
         .defer(d3.json, '/resources/skorea_municipalities_topo_simple.json')
         .defer(d3.csv, '/resources/18th.csv')
         .awaitAll(function(err, files) {
             resolve(files);
         });
    });
}

export default { 
    loadAll: loadAll
};