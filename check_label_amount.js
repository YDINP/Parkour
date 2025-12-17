const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== New Label (ID 70) 상세 정보 ===\n');

const node70 = data[70];
console.log('Node 70 (New Label):');
console.log('  Name:', node70._name);
console.log('  Active:', node70._active);
console.log('  Position:', node70._trs ? `(${node70._trs.array[0]}, ${node70._trs.array[1]})` : 'N/A');
console.log('  Scale:', node70._trs ? `(${node70._trs.array[6]}, ${node70._trs.array[7]})` : 'N/A');
if (node70._contentSize) {
    console.log('  Size:', `${node70._contentSize.width} x ${node70._contentSize.height}`);
}
if (node70._color) {
    console.log('  Color:', `rgba(${node70._color.r}, ${node70._color.g}, ${node70._color.b}, ${node70._color.a})`);
}
if (node70._opacity !== undefined) {
    console.log('  Opacity:', node70._opacity);
}

// Label component (ID 71)
const label71 = data[71];
console.log('\nLabel component (ID 71):');
console.log('  Type:', label71.__type__);
console.log('  Enabled:', label71._enabled);
console.log('  String:', label71._string);
console.log('  FontSize:', label71._fontSize);
if (label71._N$file) {
    console.log('  Font UUID:', label71._N$file.__uuid__);
}

// resIcon (ID 63)
const resIcon = data[63];
console.log('\n\nresIcon (ID 63):');
console.log('  Active:', resIcon._active);
console.log('  Position:', resIcon._trs ? `(${resIcon._trs.array[0]}, ${resIcon._trs.array[1]})` : 'N/A');
if (resIcon._contentSize) {
    console.log('  Size:', `${resIcon._contentSize.width} x ${resIcon._contentSize.height}`);
}

// resIcon의 children 확인
console.log('  Children:');
if (resIcon._children) {
    resIcon._children.forEach(childRef => {
        const child = data[childRef.__id__];
        console.log(`    - "${child._name}" (ID: ${childRef.__id__}, active: ${child._active})`);
    });
}
