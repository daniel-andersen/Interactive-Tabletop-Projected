import Library from '../library'

export default class Example1 {

    constructor() {
        this.library = new Library()
        this.library.init()

        this.exampleImageElement = document.getElementById('exampleImage')
    }

    prepare() {
        return new Promise((resolve, reject) => {
            const waitUntilReady = () => {
                if (this.exampleImageElement.complete) {
                    resolve()
                } else {
                    setTimeout(() => {
                        waitUntilReady()
                    }, 10)
                }
            }
            waitUntilReady()
        })
    }

    async run() {
        console.log("Running example...")

        await this.prepare()
        await this.runTest()
    }

    async runTest() {
        this.library.camera.setDebugImage(this.exampleImageElement)

        await this.library.shapeDetector.createShape("test", "/assets/library/calibration/calibration.png")

        await this.library.shapeDetector.detect("test").then((result) => {
            console.log("Detected shapes:")
            console.log(result)
        })
    }
}
