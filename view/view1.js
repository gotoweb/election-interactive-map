var B = bundle;
var _ = B._;

var duplications, topojsonMuni, electionInfo;

B.resource.loadAll().then(function(files) {
    duplications = files[0];
    topojsonMuni = files[1];
    electionInfo = _.filterElectionInfoForMunicipalities(files[2]);
    electionInfo = _.addColumnForMajor(electionInfo);


    var provinces = B.topojson.feature(topojsonMuni, topojsonMuni.objects['skorea_municipalities_geo']);
    var features = _.addCityForDuplicatedName(duplications, provinces.features);
    features = _.attachElectionInfo(electionInfo, features);
    
    B.render.asMap(features);
});