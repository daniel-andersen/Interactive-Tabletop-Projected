import WorkerUtil from '../workers/worker-util.js'

export default class BoardAreaWorker {
    getBoardArea(message) {
        const payload = message.data.payload
        const meta = message.data.meta

        const imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)
        const calibration = payload.calibration
        const area = payload.area

        const transformedImage = this.perspectiveTransformImage(imageData, calibration)

        const outputImageData = new ImageData(new Uint8ClampedArray(transformedImage.data), transformedImage.cols, transformedImage.rows)

        WorkerUtil.postDebugImage(meta, transformedImage)

        transformedImage.delete()

        WorkerUtil.postResponseWithImage(meta, outputImageData)
    }

    perspectiveTransformImage(imageData, calibration) {
        const size = calibration.perspectiveTransform.size

        const inputImage = cv.matFromImageData(imageData)
        const outputImage = new cv.Mat()
        const perspectiveTransform = cv.matFromArray(3, 3, cv.CV_64FC1, [
            calibration.perspectiveTransform.matrix[0], calibration.perspectiveTransform.matrix[1], calibration.perspectiveTransform.matrix[2],
            calibration.perspectiveTransform.matrix[3], calibration.perspectiveTransform.matrix[4], calibration.perspectiveTransform.matrix[5],
            calibration.perspectiveTransform.matrix[6], calibration.perspectiveTransform.matrix[7], calibration.perspectiveTransform.matrix[8]
        ])

        cv.warpPerspective(inputImage, outputImage, perspectiveTransform, new cv.Size(size.width, size.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())

        inputImage.delete()
        perspectiveTransform.delete()

        return outputImage
    }
}
