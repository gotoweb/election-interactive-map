function indexOfMax(arr) {
    return arr.indexOf(Math.max(...arr));
}

export default { 
    indexOfMax: indexOfMax
};