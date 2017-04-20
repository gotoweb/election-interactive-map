import util from './util';

function findByCode(code, features) {
    return features.find(function(feat) {
        return feat.properties.code === code.toString();
    });
}

function addCityForDuplicatedName(duplications, features) {
    duplications.forEach(function(dup) {
        var feat = findByCode(dup.code, features);
        feat.properties.city = dup.province;
    });
    
    return features;
}

function addColumnForMajor(electionInfo) {
    electionInfo.forEach(function(r, i) {
        var keys = ["새누리당\n박근혜", "민주통합당\n문재인", "무소속\n박종선", "무소속\n김소연", "무소속\n강지원", "무소속\n김순자", "무효\n투표수", "기권수"];
        
        var arr = keys.map(function(key) {
            return parseInt(r[key]);
        });
        var idx = util.indexOfMax(arr);

        var voteper = arr[idx] / parseInt(r['투표수']) * 100;
        r['유력후보'] = idx;
        r['득표율'] = voteper;
    });
    return electionInfo;
}

function filterElectionInfoForMunicipalities(electionInfo) {
    var province = [];
    var data = electionInfo.filter(r => {
        var uid = r['시도명'] + r['구시군명'];
        
        if(r['읍면동명'] === '소계') {
            if(province.indexOf(uid) === -1) {
                province.push(uid);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    });
    return data;
}

function attachElectionInfo(electionInfo, features) {

    features.forEach(function(feat) {
        if(!!feat.properties.city) {
            var found = electionInfo.filter(function(info) {
                return feat.properties.name === info['구시군명'] && feat.properties.city === info['시도명'];
            });
            if(found.length === 1) {
                feat.properties.election = found[0];
            }
            else {
                throw new TypeError('구시군명 및 시도명이 두개 일치하는 경우는 없습니다.');
            }
        }
        else {
            var found = electionInfo.filter(function(info) {
                return feat.properties.name === info['구시군명'];
            });
            if(found.length > 0) {
                feat.properties.election = found[0];
            }
            else {
                // throw new TypeError('선거 정보를 못찾는 경우');
                if(feat.properties.name === '세종시') {
                    feat.properties.election = electionInfo.find(function(info) {
                        return info['구시군명'] === '세종특별자치시';
                    });
                }
                else if(feat.properties.name === '여주시') {
                    feat.properties.election = electionInfo.find(function(info) {
                        return info['구시군명'] === '여주군';
                    });
                }
            }
        }
    });

    return features;
}


export default { 
    findByCode: findByCode,
    addCityForDuplicatedName: addCityForDuplicatedName,
    addColumnForMajor: addColumnForMajor,
    filterElectionInfoForMunicipalities: filterElectionInfoForMunicipalities,
    attachElectionInfo: attachElectionInfo
};