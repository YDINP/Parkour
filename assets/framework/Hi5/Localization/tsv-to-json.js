/*
// tsv-to-json.js (자동 탐색 및 변환)
const fs = require('fs');
const path = require('path');

// ========== 설정 ==========
const CONFIG = {
  // Localize 폴더 경로 (TSV와 JSON이 함께 있는 곳)
  localizePath: path.join(__dirname, '../Localization'),
  
  // 지원 언어
  languages: ['Ko', 'En', 'Cn'],
  
  // 탭 구분자
  separator: '\t'
};

// ========== TSV 파싱 함수 ==========
function parseTSV(content) {
  const lines = content.split('\n');
  const result = [];
  
  // 첫 줄은 헤더
  const headers = lines[0].split(CONFIG.separator).map(h => h.trim());
  
  // 나머지 줄은 데이터
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 빈 줄 스킵
    
    const values = line.split(CONFIG.separator);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    
    result.push(row);
  }
  
  return result;
}

// ========== TSV 파일 찾기 ==========
function findTsvFiles() {
  const fileList = [];
  
  // Localize 폴더가 없으면 생성
  if (!fs.existsSync(CONFIG.localizePath)) {
    fs.mkdirSync(CONFIG.localizePath, { recursive: true });
    console.log(`   ✓ ${CONFIG.localizePath} 폴더 생성됨`);
    return fileList;
  }
  
  const files = fs.readdirSync(CONFIG.localizePath);
  
  files.forEach(file => {
    if (file.endsWith('.tsv')) {
      const filePath = path.join(CONFIG.localizePath, file);
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// ========== 단일 TSV 변환 ==========
function convertSingleTsv(tsvPath) {
  const fileName = path.basename(tsvPath, '.tsv');
  
  console.log(`\n📦 ${fileName}.tsv`);
  
  try {
    // TSV 읽기
    const content = fs.readFileSync(tsvPath, 'utf8');
    const rawData = parseTSV(content);
    
    // 언어별 데이터 구조 생성
    const result = {
      ko: {},
      en: {},
      cn: {}
    };
    
    let validCount = 0;
    let skipCount = 0;
    
    rawData.forEach((row) => {
      const key = row.Key;
      
      // 키가 없거나 #으로 시작하면 스킵
      if (!key || key.startsWith('#')) {
        skipCount++;
        return;
      }
      
      // 언어별 데이터 저장
      CONFIG.languages.forEach(lang => {
        const value = row[lang];
        const langKey = lang.toLowerCase();
        
        if (value !== undefined && value !== null && value !== '') {
          result[langKey][key] = value;
        } else {
          // 빈 값이면 키 그대로 (디버깅용)
          result[langKey][key] = key;
        }
      });
      
      validCount++;
    });
    
    // JSON 저장 경로 (TSV와 같은 폴더)
    const outputPath = path.join(CONFIG.localizePath, fileName + '.json');
    
    // JSON 저장
    fs.writeFileSync(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf8'
    );
    
    console.log(`   ✓ 유효: ${validCount}개, 스킵: ${skipCount}개`);
    console.log(`   ✓ 저장: ${fileName}.json`);
    
    return {
      success: true,
      inputPath: tsvPath,
      outputPath: outputPath,
      fileName: fileName,
      validCount: validCount,
      skipCount: skipCount,
      data: result
    };
    
  } catch (error) {
    console.error(`   ❌ 실패: ${error.message}`);
    return {
      success: false,
      inputPath: tsvPath,
      fileName: fileName,
      error: error.message
    };
  }
}

// ========== 모든 TSV 파일 변환 ==========
function convertAllTsvFiles() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  TSV → JSON 일괄 변환');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // 1. Localize 폴더에서 TSV 파일 찾기
    console.log('🔍 TSV 파일 검색 중...');
    console.log(`   위치: ${CONFIG.localizePath}\n`);
    
    const tsvFiles = findTsvFiles();
    
    if (tsvFiles.length === 0) {
      console.log('⚠️  TSV 파일이 없습니다.');
      console.log(`\n💡 다음 위치에 TSV 파일을 추가하세요:`);
      console.log(`   ${CONFIG.localizePath}\n`);
      console.log(`📝 예시 파일명:`);
      console.log(`   - localization_main.tsv`);
      console.log(`   - localization_items.tsv`);
      console.log(`   - localization_skills.tsv\n`);
      return;
    }
    
    console.log(`   ✓ ${tsvFiles.length}개 TSV 파일 발견\n`);
    
    // 파일 목록 출력
    console.log('📋 발견된 TSV 파일:');
    tsvFiles.forEach((file, index) => {
      const fileName = path.basename(file);
      console.log(`   ${index + 1}. ${fileName}`);
    });
    
    // 2. 각 파일 변환
    console.log('\n🔄 변환 시작...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const results = [];
    
    tsvFiles.forEach(tsvPath => {
      const result = convertSingleTsv(tsvPath);
      results.push(result);
    });
    
    // 3. 결과 요약
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  변환 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`✅ 성공: ${successCount}개`);
    if (failCount > 0) {
      console.log(`❌ 실패: ${failCount}개`);
    }
    
    // 성공한 파일 목록
    console.log('\n📁 생성된 JSON 파일:');
    results.filter(r => r.success).forEach(result => {
      console.log(`   ✓ ${result.fileName}.json (${result.validCount}개 키)`);
    });
    
    // 총 통계
    let totalKeys = { ko: 0, en: 0, cn: 0 };
    results.filter(r => r.success).forEach(result => {
      CONFIG.languages.forEach(lang => {
        const langKey = lang.toLowerCase();
        totalKeys[langKey] += Object.keys(result.data[langKey]).length;
      });
    });
    
    console.log('\n📊 전체 통계:');
    console.log(`   Ko: ${totalKeys.ko}개 키`);
    console.log(`   En: ${totalKeys.en}개 키`);
    console.log(`   Cn: ${totalKeys.cn}개 키`);
    
    // 실패한 파일 목록
    if (failCount > 0) {
      console.log('\n⚠️  실패한 파일:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.fileName}: ${result.error}`);
      });
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Cocos Creator에서 확인하세요!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ========== 실행 ==========
if (require.main === module) {
  convertAllTsvFiles();
}

module.exports = { 
  convertAllTsvFiles,
  convertSingleTsv,
  findTsvFiles,
  parseTSV
};
*/