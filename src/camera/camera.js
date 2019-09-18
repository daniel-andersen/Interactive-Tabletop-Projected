export default class Camera {
    constructor() {
        this.videoElement = document.getElementById('cvVideo')
        this.videoCanvasElement = document.getElementById('cvVideoCanvas')
        this.videoCanvasContext = this.videoCanvasElement.getContext('2d')

        this.inputSource = this.videoElement
        this.inputSourceSize = {width: 1920, height: 1080}
    }

    setDebugImage(imageElement) {
        this.inputSource = imageElement
        this.inputSourceSize = {width: this.inputSource.offsetWidth, height: this.inputSource.offsetHeight}
    }

    async getCameraImage(size=this.inputSourceSize) {
        return this._getCameraImage(this.inputSource, this.inputSourceSize.width, this.inputSourceSize.height, size.width, size.height)
    }

    async _getCameraImage(element, srcWidth, srcHeight, dstWidth, dstHeight) {
        return new Promise((resolve, reject) => {
            this.videoCanvasContext.drawImage(element, 0, 0, srcWidth, srcHeight, 0, 0, dstWidth, dstHeight)
            let imageData = this.videoCanvasContext.getImageData(0, 0, dstWidth, dstHeight)
            resolve(imageData)
        })
    }
}
