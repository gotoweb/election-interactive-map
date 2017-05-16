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

var chunkSize = 1024 * 1024 * 1; // 1MB

function NetworkStreamer(config) {

	config = config || {};
	var xhr;
	this._start = 0;
	this.fileSize = -1;

	this.readChunk = function(offset) {
		offset = offset || 0;
		xhr = new XMLHttpRequest();

		xhr.open('GET', config.url  + ((/\?/).test(config.url) ? "&" : "?") + (new Date()).getTime(), true);

		var end = chunkSize - 1;

		
		var rangeString = 'bytes=0-' + end;
		if(this.fileSize > 0) {
			if(offset == this.fileSize) {
				rangeString = 'bytes=' + (offset - 1) + '-';
			}
			else if(offset + end > this.fileSize) {
				rangeString = 'bytes=' + offset + '-';
			}
			else {
				rangeString = 'bytes=' + offset + '-' + (offset + end);
			}
		}

		// console.log(rangeString);
		xhr.setRequestHeader('Range', rangeString);
		xhr.setRequestHeader('If-None-Match', 'webkit-no-cache');

		xhr.onload = this.chunkLoaded.bind(this);

		xhr.onerror = function(errorMessage) {
			console.log(xhr.statusText, errorMessage);
		}

		try {
			xhr.send()    
		} catch (error) {
			debugger;
		}
		// this._start += chunkSize;
	}

	this.chunkLoaded = function() {
		if(xhr.readyState != 4) {
			console.log('readyState', xhr.readyState);
			return;
		}

		if (xhr.status < 200 || xhr.status >= 400) {
            console.log(xhr.status)
            console.log(xhr.getResponseHeader('Content-Length'))
			debugger;
			return;
		}

		this.fileSize = getFileSize(xhr);

		// console.log(xhr)
		// console.log(xhr.responseText.length);
		if(isFunction(config.onLoaded)) {
            var contlen = parseInt(xhr.getResponseHeader('Content-Length'));
			config.onLoaded(xhr.responseText, contlen);
		}
        else {
            console.log('실화냐')
        }
	}

	

	this.readChunk();

	function getFileSize(xhr) {
		var contentRange = xhr.getResponseHeader('Content-Range');
		if (contentRange === null) {
			return -1;
		}
		return parseInt(contentRange.substr(contentRange.lastIndexOf('/') + 1));
	}

	function isFunction(fn) {
		return typeof fn === 'function';
	}
}

export default { 
    loadAll: loadAll,
    NetworkStreamer: NetworkStreamer
};