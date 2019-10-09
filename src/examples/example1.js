import Library from '../library'
import BoardArea from '../board-area/board-area'

export default class Example1 {

    constructor() {
        new Library().init()

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
        //window.library.camera.setDebugImage(this.exampleImageElement)

        setTimeout(() => {
            const imageData = await window.library.boardArea.getImage(BoardArea.Area.CameraImage)

            window.library.debugCanvas.getContext("2d").clearRect(0, 0, window.library.debugCanvas.width, window.library.debugCanvas.height)
            window.library.debugCanvas.getContext("2d").putImageData(imageData, 0, 0)
            window.library.debugCanvas.style.visibility = "visible"
        }, 1000)
    }
}
