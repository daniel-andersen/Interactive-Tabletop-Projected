class Library {
    init() {
        console.log("Initializing library...")

        window.config = new Config()
        window.library = this

        this.videoElement = document.getElementById('cvVideo')
        this.videoCanvasElement = document.getElementById('cvVideoCanvas')
        this.videoCanvasContext = this.videoCanvasElement.getContext('2d')

        this.inputSource = this.videoElement
        this.inputSourceSize = {width: 1920, height: 1080}

        console.log("Library initialized!")
    }

    setDebugImage(imageElement) {
        this.inputSource = imageElement
        this.inputSourceSize = {width: this.inputSource.offsetWidth, height: this.inputSource.offsetHeight}
    }

    requestImageData(size) {
        return this.getImageData(this.inputSource, this.inputSourceSize.width, this.inputSourceSize.height, size.width, size.height)
    }

    getImageData(element, srcWidth, srcHeight, dstWidth, dstHeight) {
        this.videoCanvasContext.drawImage(element, 0, 0, srcWidth, srcHeight, 0, 0, dstWidth, dstHeight)
        let imageData = this.videoCanvasContext.getImageData(0, 0, dstWidth, dstHeight)
        return imageData
    }
}
