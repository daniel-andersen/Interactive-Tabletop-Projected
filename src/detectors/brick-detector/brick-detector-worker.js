import WorkerUtil from '../../workers/worker-util.js'

export default class BrickDetectorWorker {
    detect(message) {
        let payload = message.data.payload
        let meta = message.data.meta

        let imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)

        let frame = cv.matFromImageData(imageData)

        let dst = new cv.Mat()

        cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0)
        cv.Canny(frame, dst, 50, 100, 3, false)

        frame.delete()
        dst.delete()

        WorkerUtil.postResponse(meta, {
            "bricks": []
        })
    }
}
