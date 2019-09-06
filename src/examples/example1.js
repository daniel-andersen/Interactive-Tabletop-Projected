class Example1 {

    constructor() {
        this.library = new Library()
        this.library.init()

        this.exampleImageElement = document.getElementById('exampleImage')
    }

    prepare() {
        return new Promise((resolve, reject) => {
            let waitUntilReady = () => {
                if (this.exampleImageElement.complete) {
                    resolve()
                } else {
                    setTimeout(() =>
                        waitUntilReady()
                    , 10)
                }
            }
            waitUntilReady()
        })
    }

    async run() {
        console.log("Running example...")

        await this.prepare()

        this.library.camera.setDebugImage(this.exampleImageElement)

        let imageData = await this.library.camera.getCameraImage(Library.Sizes.p480)

        this.library.brickDetector.detect().then((bricks) => {
            console.log("Detected bricks 1:")
            console.log(bricks)
        })
        this.library.brickDetector.detect().then((bricks) => {
            console.log("Detected bricks 2:")
            console.log(bricks)
        })
        this.library.brickDetector.detect().then((bricks) => {
            console.log("Detected bricks 3:")
            console.log(bricks)
        })
    }
}
