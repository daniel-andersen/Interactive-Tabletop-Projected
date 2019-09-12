class Util {
    static idOffset = 0

    static randomId() {
        return new Date().valueOf() + (Util.idOffset++)
    }
}
