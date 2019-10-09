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
            const imageData = this.videoCanvasContext.getImageData(0, 0, dstWidth, dstHeight)
            resolve(imageData)
        })
    }

    async getVideoStream(constraints) {
        if (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
            return window.navigator.mediaDevices.getUserMedia(constraints)
        } else {
            const getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia || window.navigator.msGetUserMedia
            if (getUserMedia) {
                return new Promise((resolve, reject) => {
                    getUserMedia(constraints, (stream) => {
                        resolve(stream)
                    }, () => {
                        reject("Error getting legacy video stream")
                    })
                })
            } else {
                return new Promise((resolve, reject) => {
                    reject('No user media available')
                })
            }
        }
    }

    async init() {
        const constraints = {
            audio: false,
            video: {
                width: { exact: 640 },
                height: { exact: 480 }
                //width: { exact: 1920 },
                //height: { exact: 1080 }
            }
        }

        return new Promise((resolve, reject) => {
            this.getVideoStream(constraints).then((stream) => {
                this.videoElement.srcObject = stream
                this.videoElement.addEventListener('loadeddata', () => {
                    var attempts = 10
                    const checkVideo = () => {
                        if (attempts > 0) {
                            if (this.videoElement.videoWidth > 0 && this.videoElement.videoHeight > 0) {
                                console.log('Video size: ' + this.videoElement.videoWidth + 'x' + this.videoElement.videoHeight)
                                this.inputSourceSize = {
                                    width: this.videoElement.videoWidth,
                                    height: this.videoElement.videoHeight
                                }
                                this.videoElement.play()
                                resolve()
                            } else {
                                setTimeout(checkVideo, 100)
                            }
                        } else {
                            reject('Unable to play video stream')
                        }
                        attempts--
                    }
                    checkVideo()
                }, false)
            }).catch((e) => {
                reject(e)
            })
        })
    }
}
