export default class SpatialPartition {

    gridPartition: GridPartition
    static create(cellw, cellh) {
        let n = new SpatialPartition;
        n.gridPartition = new GridPartition(cellw, cellh);
        return n;
    }

    insert(entity) {
        this.gridPartition.add(entity);
    }

    retrieve(rect) {
        let x = rect[0];
        let y = rect[1]
        let radius = Math.ceil(Math.max(rect[2], rect[3]) / this.gridPartition.cellHeight);
        return this.gridPartition.query(x, y, radius, true);
    }

    remove(entity) {
        this.gridPartition.remove(entity)
    }

    clear() {
        this.gridPartition.clear();
    }
}