class Util {
    static idOffset = 0

    static randomId() {
        return new Date().valueOf() + (Util.idOffset++)
    }
}

class Point2i {
    constructor(x=undefined, y=undefined) {
        this.x = x
        this.y = y
    }

    isDefined() {
        return this.x !== undefined && this.y !== undefined
    }
}
