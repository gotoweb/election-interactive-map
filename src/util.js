function indexOfMax(arr) {
    return arr.indexOf(Math.max(...arr));
}

/*
function getMaxIndex(arr) {
    return arr.reduce(function (iMax, x, i, arr) { 
        return x > arr[iMax] ? i : iMax;
    }, 0);
}
*/

function getPriormap(data) {
    var map = {};

    var lastKey;

    data.forEach(function(item) {
        if(!map[item[0]]) {
            map[item[0]] = {};
            lastKey = item[0];
        }

        var total = item[4];
        var arr = item.splice(6, 6);
        var returnable = {};
        var maximum = Math.max.apply(null, arr);
        if(maximum > 0) {
            returnable[indexOfMax(arr)] = parseFloat((maximum / total * 100).toFixed(2));
            // returnable[indexOfMax(arr)] = (maximum / total * 100);
            var key = item[1] + item[2];
            map[item[0]][key] = returnable;
        }
    });
    // if(lastKey != '201212200525') {
    // 	delete map[lastKey];
    // }

    return map;
}

function getRandomPort() {
    return Math.floor( Math.random() * (65535 - 3000) + 3000 );
}

export default { 
    indexOfMax: indexOfMax,
    getPriormap: getPriormap,
    getRandomPort: getRandomPort
};