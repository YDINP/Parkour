
export default class skinData {

    id: number = 0;
    name: string = "";
    type: string = "";
    num: number = 0;
    date: string = "";
    path: string = "";
    public constructor(id) {
        let data = csv.skin.get(id);
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.num = data.number;
        this.date = data.date;
        this.path = data.path;
    }
}
