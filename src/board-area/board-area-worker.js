import WorkerUtil from '../workers/worker-util.js'

export default class BoardAreaWorker {
    getBoardArea(message) {
        let payload = message.data.payload
        let meta = message.data.meta

        let imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)
        let calibration = payload.calibration
        let area = payload.area

        let transformedImage = this.perspectiveTransformImage(imageData, calibration)

        let outputImageData = new ImageData(new Uint8ClampedArray(transformedImage.data), transformedImage.cols, transformedImage.rows)

        transformedImage.delete()

        WorkerUtil.postResponseWithImage(meta, outputImageData)
    }

    perspectiveTransformImage(imageData, calibration) {
        let size = calibration.perspectiveTransform.size

        let sourceImage = cv.matFromImageData(imageData)
        let outputImage = new cv.Mat()
        let perspectiveTransform = cv.matFromArray(3, 3, cv.CV_64FC1, [
            calibration.perspectiveTransform.matrix[0], calibration.perspectiveTransform.matrix[1], calibration.perspectiveTransform.matrix[2],
            calibration.perspectiveTransform.matrix[3], calibration.perspectiveTransform.matrix[4], calibration.perspectiveTransform.matrix[5],
            calibration.perspectiveTransform.matrix[6], calibration.perspectiveTransform.matrix[7], calibration.perspectiveTransform.matrix[8]
        ])

        cv.warpPerspective(sourceImage, outputImage, perspectiveTransform, new cv.Size(size.width, size.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())

        sourceImage.delete()
        perspectiveTransform.delete()

        return outputImage
    }
}
