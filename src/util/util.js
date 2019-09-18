export default class Util {
    static randomId() {
        return new Date().valueOf() + (Util.idOffset++)
    }
}

Util.idOffset = 0
