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

    static async loadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = imageUrl
        })
    }

    static getImageData(image) {
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
