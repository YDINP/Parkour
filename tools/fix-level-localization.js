/**
 * Level.csv와 로컬라이제이션 파일 간 불일치 수정 스크립트
 *
 * 문제: Level.csv의 레벨 번호(0, 1, 2, ...)와 로컬라이제이션 키(map.name.1, map.name.2, ...)가 1씩 밀려있음
 * 해결: Level.csv의 실제 컨셉 이름을 기반으로 올바른 로컬라이제이션 키 생성
 */

const fs = require('fs');
const path = require('path');

// CSV 파일 파싱
function parseCSV(content) {
    const lines = content.trim().split('\n');
    // 첫 3줄은 헤더
    const headers = lines[1].split('\t').map(h => h.replace(/"/g, ''));
    const data = [];

    for (let i = 3; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.replace(/"/g, ''));
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        data.push(row);
    }
    return data;
}

// Level.csv 읽기
const levelCsvPath = path.join(__dirname, '..', 'assets', 'resources', 'Config', 'csv', 'Level.csv');
const levelCsvContent = fs.readFileSync(levelCsvPath, 'utf8');
const levels = parseCSV(levelCsvContent);

// 로컬라이제이션 JSON 읽기
const localizePath = path.join(__dirname, '..', 'assets', 'resources', 'Localize', 'localization.json');
const localizeContent = fs.readFileSync(localizePath, 'utf8');
const localize = JSON.parse(localizeContent);

// 컨셉 번역 매핑 (영어 -> 한국어)
const conceptMap = {
    'newplayer': '초급 레벨',
    'forest': '숲',
    'castle': '요새',
    'cave': '동굴',
    'volcano': '화산',
    'maya': '마야',
    'desert': '사막',
    'ice': '빙설',
    'cell': '감옥',
    'dark': '암흑',
    'bush': '덤불'
};

// 컨셉별 카운터
const conceptCounters = {};

// 새 로컬라이제이션 데이터 생성
const newMapNames = {};

console.log('Level.csv 분석 결과:\n');
console.log('Level\tConcept\tCSV Name\tGenerated Name');
console.log('-----\t-------\t--------\t--------------');

levels.forEach(level => {
    const levelNum = level.level;
    const segs = level.segs;
    const csvName = level.name;

    if (!segs) return;

    // segs에서 컨셉 추출 (예: "forest+1+3+16" -> "forest")
    let concept = segs.split('+')[0];

    // newplayer는 특별 처리
    if (concept === 'newplayer') {
        newMapNames[`map.name.${levelNum}`] = conceptMap['newplayer'];
        console.log(`${levelNum}\tnewplayer\t${csvName}\t${conceptMap['newplayer']}`);
        return;
    }

    // 컨셉 카운터 증가
    if (!conceptCounters[concept]) {
        conceptCounters[concept] = 0;
    }
    conceptCounters[concept]++;

    const koreanConcept = conceptMap[concept] || concept;
    const generatedName = `${koreanConcept} ${conceptCounters[concept]}`;

    newMapNames[`map.name.${levelNum}`] = generatedName;

    // CSV 이름과 생성된 이름이 다르면 표시
    const mismatch = (csvName !== level.name) ? ' (CHANGED)' : '';
    console.log(`${levelNum}\t${concept}\t${csvName}\t${generatedName}${mismatch}`);
});

// 기존 map.name 키들 제거하고 새 키들 추가
console.log('\n\n로컬라이제이션 업데이트 중...');

// 한국어 업데이트
const existingKoKeys = Object.keys(localize.ko).filter(k => k.startsWith('map.name.'));
existingKoKeys.forEach(k => {
    if (k !== 'map.name.tutorial') {
        delete localize.ko[k];
    }
});

// 새 키 추가
Object.entries(newMapNames).forEach(([key, value]) => {
    localize.ko[key] = value;
});

// 영어도 업데이트 (한국어와 동일하게)
if (localize.en) {
    const existingEnKeys = Object.keys(localize.en).filter(k => k.startsWith('map.name.'));
    existingEnKeys.forEach(k => {
        if (k !== 'map.name.tutorial') {
            delete localize.en[k];
        }
    });
    Object.entries(newMapNames).forEach(([key, value]) => {
        localize.en[key] = value;
    });
}

// 중국어도 업데이트 (Level.csv의 원래 이름 사용)
if (localize.cn) {
    const existingCnKeys = Object.keys(localize.cn).filter(k => k.startsWith('map.name.'));
    existingCnKeys.forEach(k => {
        if (k !== 'map.name.tutorial') {
            delete localize.cn[k];
        }
    });
    levels.forEach(level => {
        if (level.level && level.name) {
            localize.cn[`map.name.${level.level}`] = level.name;
        }
    });
}

// 파일 저장
fs.writeFileSync(localizePath, JSON.stringify(localize, null, 2), 'utf8');
console.log(`\n완료! ${localizePath} 파일이 업데이트되었습니다.`);

// 요약 출력
console.log('\n컨셉별 레벨 수:');
Object.entries(conceptCounters).forEach(([concept, count]) => {
    console.log(`  ${concept}: ${count}개`);
});
