class Example1 {

    constructor() {
        this.library = new Library()
        this.library.init()
    }

    run() {
        console.log("Running example...")

        this.exampleImageElement = document.getElementById('exampleImage')
        this.library.setDebugImage(this.exampleImageElement)

        let imageData = this.library.requestImageData({width: 640, height: 480})
        console.log(imageData)
    }
}
