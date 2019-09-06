class BrickDetectorWorker {
    detect(message) {
        let payload = message.data.payload
        let meta = message.data.meta

        let imageData = new ImageData(new Uint8ClampedArray(payload.imageDataBuffer), payload.width, payload.height)
        let frame = cv.matFromImageData(imageData)

        let dst = new cv.Mat()

        cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0)
        cv.Canny(frame, dst, 50, 100, 3, false)

        frame.delete()
        dst.delete()

        postResponse(meta, {bricks: []})
    }
}
