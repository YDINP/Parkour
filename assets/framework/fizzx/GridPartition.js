/**
     * Check if a given value of null or undefined.
     *
     * @param {*} value - The query value.
     * @returns {boolean} - Whether or not the given value is null or undefined.
     */
function isNullOrUndefined(value) {
    return value === null || value === undefined;
}

/**
 * Find the modulo m for number n. This is used in place of the JS % operator as it behaves
 * as one would with negative numbers expect, while the default JS implementation.
 *
 * @param {number} n - The number n.
 * @param {number} m - Modulo m.
 * @returns {number} - The result of of n mod m.
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * Creates a new GridPartition object.
 *
 * @param {number} width - The width of the world-space.
 * @param {number} height - The height of the world-space.
 * @param numberCellsX - The number of cells to divide the x-dimension to.
 * @param numberCellsY - The number of cells to divide the y-dimension to.
 * @constructor
 */
// function GridPartition(width, height, numberCellsX, numberCellsY) {
function GridPartition(cellWidth, cellHeight) {
    // this.width = isNullOrUndefined(width) ? 100 : width;
    // this.height = isNullOrUndefined(height) ? 100 : height;
    // this.numberCellsX = isNullOrUndefined(numberCellsX) ? 10 : numberCellsX;
    // this.numberCellsY = isNullOrUndefined(numberCellsY) ? 10 : numberCellsY;
    // this.cellWidth = this.width / this.numberCellsX;
    // this.cellHeight = this.height / this.numberCellsY;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.numberCellsY = 0
    this.numberCellsX = 0

    // default x-y accessors
    this._x = function (d) {
        return d.x;
    };

    this._y = function (d) {
        return d.y;
    };

    // initialise the cells and create the entity map
    this.clear();
}

/**
 * Adds an entity to the grid.
 *
 * @param {Object} entity - The entity to add to the grid.
 */
GridPartition.prototype.add = function (entity) {
    var posX = Math.floor(this._x.call(null, entity));
    var posY = Math.floor(this._y.call(null, entity));
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);

    this.getOrAddCell(cellX, cellY).push(entity);
    if (this.numberCellsY < cellY) {
        this.numberCellsY = cellY;
    }
    if (this.numberCellsX < cellX) {
        this.numberCellsX = cellX;
    }
    this._entityMap.set(entity, [cellX, cellY]);
};

GridPartition.prototype.getOrAddCell = function (cellX, cellY) {
    let sub = this._cells[cellY];
    if (sub == null) {
        sub = new Map();
        this._cells[cellY] = sub;
    }
    let ssub = sub[cellX];
    if (ssub == null) {
        ssub = [];
        sub[cellX] = ssub;
    }
    return ssub;
}

GridPartition.prototype.getCell = function (cellX, cellY) {
    return this._cells[cellY][cellX]
}

/**
 * Adds multiple entities to the grid.
 *
 * @param {Array} entities - An array of entities to add to the grid.
 */
GridPartition.prototype.addAll = function (entities) {
    entities.forEach(function (entity) {
        this.add(entity);
    }.bind(this));
};

/**
 * Clears the grid of all entities.
 */
GridPartition.prototype.clear = function () {
    this._cells = new Map();
    this._entityMap = new Map();
};


/**
 * Gets an array of entities belonging to the same cell as the
 * x and y position from the world-space. This maps the input
 * world-space co-ordinate to the corresponding grid cell.
 *
 * @param {number} posX - The query x-position.
 * @param {number} posY - The query y-position.
 * @returns {Array} - An array of entities belonging to the same cell.
 */
GridPartition.prototype.getCellByWorldCoord = function (posX, posY) {
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);
    return this.getCell(cellX, cellY);
};

/**
 * Return the entities belonging to the cell at [cellX, cellY], and those belonging
 * to the cells that are ``radius`` distance. The wrapping parameter determines whether or
 * not the search should look on the opposite side of the grid space if the search radius
 * falls "outside" the grid.
 *
 * @param {number} cellX - The grid's x-coordinate.
 * @param {number} cellY - The grid's y-coordinate.
 * @param {number} radius - The search radius. Default 1. Negative
 *                          input will just default to 0.
 * @param {boolean} wrap - Whether or not to wrap the search radius around the space.
 * @returns {Array} - An array of entities belonging to the search neighbourhood. Default true.
 */
GridPartition.prototype.getNeighbourhood = function (cellX, cellY, radius, wrap) {
    // default parameters
    if (isNullOrUndefined(radius)) { radius = 1; }
    if (radius < 0) { radius = 0; }
    if (isNullOrUndefined(wrap)) { wrap = false; }

    // array for all output entities
    var result = [];

    var i, j, iMod, jMod, currentCell;
    for (i = (cellX - radius); i <= (cellX + radius); i++) {
        for (j = (cellY - radius); j <= (cellY + radius); j++) {
            iMod = mod(i, this.numberCellsX);
            jMod = mod(j, this.numberCellsY);
            if (!wrap && (iMod !== i || jMod !== j)) {
                continue;
            }
            currentCell = this.getCell(iMod, jMod);
            result = result.concat(currentCell);
        }
    }

    return result;
};

/**
 * Given a world-space x, y co-ordinate, find all neighbours belonging to neighbouring grids.
 * See getNeighbourhood.
 *
 * @param {number} posX - The grid's x-coordinate.
 * @param {number} posY - The grid's y-coordinate.
 * @param {number} radius - The search radius.
 * @param {boolean} wrap - Whether or not to wrap the search radius around the space.
 * @returns {Array} - An array of entities belonging to the search neighbourhood.
 */
GridPartition.prototype.query = function (posX, posY, radius, wrap) {
    var cellX = Math.floor(Math.floor(posX) / this.cellWidth);
    var cellY = Math.floor(Math.floor(posY) / this.cellHeight);
    return this.getNeighbourhood(cellX, cellY, radius, wrap);
};

/**
 * Update the cell an entity belongs to if its world-space co-ordinates have changed.
 *
 * @param {Object} entity - The entity to update.
 * @returns {boolean} - True if an update was successful.
 */
GridPartition.prototype.update = function (entity) {
    // remove the entity
    if (!this.remove(entity)) return false;

    // now add it again!
    this.add(entity);
    return true;
};

/**
 * Update the cells for multiple entities.
 *
 * @param {Array} entities - An array of entities to update.
 */
GridPartition.prototype.updateAll = function (entities) {
    this.clear();
    this.addAll(entities);
};

/**
 * Remove an entity from the grid.
 *
 * @param entity
 * @returns {boolean}
 */
GridPartition.prototype.remove = function (entity) {
    var cellCoord = this._entityMap.get(entity);
    if (isNullOrUndefined(cellCoord)) return false;

    // remove entity from cell
    var cell = this.getCell(cellCoord[0], cellCoord[1]);
    var index = cell.indexOf(entity);
    cell.splice(index, 1);

    // remove entity from hash-map
    this._entityMap.delete(entity)
    // delete this._entityMap[entity];

    return true;
};

/**
 * Set a custom x coordinate accessor for the entities.
 * This defaults to the x property of the entity.
 *
 * @param {Function} _ - A function returning the x-coordinate for the entity.
 * @returns {GridPartition} - Returns this GridPartition.
 */
GridPartition.prototype.x = function (_) {
    if (!isNullOrUndefined(_)) {
        this._x = _;
        return this;
    }
    return this._x;
};

/**
 * Set a custom y coordinate accessor for the entities.
 * This defaults to the y property of the entity.
 *
 * @param {Function} _ - A function returning the y-coordinate for the entity.
 * @returns {GridPartition} - Returns this GridPartition.
 */
GridPartition.prototype.y = function (_) {
    if (!isNullOrUndefined(_)) {
        this._y = _;
        return this;
    }
    return this._y;
};
