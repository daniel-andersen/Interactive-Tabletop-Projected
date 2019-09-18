export default class Util {
    static randomId() {
        return new Date().valueOf() + (Util.idOffset++)
    }

    static randomFloatInRange(a, b) {
        return a + (Math.random() * (b - a))
    }

    static randomIntInRange(a, b) {
        return a + Math.floor(Math.random() * (b - a))
    }

    static currentTimeSeconds() {
        return new Date().getTime() / 1000.0
    }

    static currentTimeMillis() {
        return new Date().getTime()
    }
}

Util.idOffset = 0
