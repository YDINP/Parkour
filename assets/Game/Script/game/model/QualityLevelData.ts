export default class QualityLevelData {
    values: number[] = []
    id: string;
    public constructor(key) {
        this.id = key;
        let d = csv.QualityLevel.get(key)
        for (let i = 0; i < 6; i++) {
            this.values.push(d['lv' + (i + 1)])
        }
    }
}