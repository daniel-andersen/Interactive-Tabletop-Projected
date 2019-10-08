import WorkerUtil from '../../workers/worker-util.js'

export default class ShapeDetectorWorker {
    detect(message) {
        const payload = message.data.payload
        const meta = message.data.meta

        const imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)

        const sourceImage = cv.matFromImageData(imageData)

        // Grayscale image
        cv.cvtColor(sourceImage, sourceImage, cv.COLOR_RGB2GRAY, 0)

        const cannyImage = new cv.Mat()
        cv.Canny(sourceImage, cannyImage, 50, 100, 3, false)

        sourceImage.delete()
        cannyImage.delete()

        return WorkerUtil.handleResponse(meta, {
            "bricks": []
        })
    }
}
