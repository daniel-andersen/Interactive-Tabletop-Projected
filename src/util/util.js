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

    static pointsDistance(p1, p2) {
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
    }

    static pointsAngle(p1, p2, p3) {
        const v1 = {x: p1.x - p2.x, y: p1.y - p2.y}
        const v2 = {x: p3.x - p2.x, y: p3.y - p2.y}

        const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x)

        return angle % (Math.PI * 2.0)
    }

    static angleDifference(angle1, angle2) {
        return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2))
    }

    static async loadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = imageUrl
        })
    }

    static async getImageData(image) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height

            const context = canvas.getContext('2d')
            context.drawImage(image, 0, 0)

            const imageData = context.getImageData(0, 0, image.width, image.height)
            resolve(imageData)
        })
    }
}

Util.idOffset = 0
