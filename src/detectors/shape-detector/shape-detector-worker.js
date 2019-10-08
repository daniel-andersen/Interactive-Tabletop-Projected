import WorkerUtil from '../../workers/worker-util.js'
import OpenCvUtil from '../../workers/opencv-util.js'
import Shape from './shape.js'

export default class ShapeDetectorWorker {
    createShape(message) {
        const payload = message.data.payload
        const meta = message.data.meta

        const imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)

        const inputImage = cv.matFromImageData(imageData)

        const shape = new Shape({id: payload.shape.id, inputImage: inputImage})

        this.storeShape(shape)

        inputImage.delete()

        return WorkerUtil.handleResponse(meta, {
            "shape": {
                id: shape.id
            }
        })
    }

    detect(message) {
        const payload = message.data.payload
        const meta = message.data.meta

        const imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)
        const shape = this.getShape(payload.shape.id)

        // Find contours
        const [contours, hierarchy] = this.getContours(imageData)

        // Detect shapes
        const shapes = []

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i)
            const otherShape = new Shape({id: shape.id, contour: contour})

            const result = shape.compare(otherShape)

            if (result.match) {
                shapes.push(result.shape)

                const tmpImage = cv.matFromImageData(imageData)
                const cts = new cv.MatVector()
                cts.push_back(otherShape.simplifiedContour)
                cv.drawContours(tmpImage, cts, 0, new cv.Scalar(255, 0, 255, 255), 2)
                WorkerUtil.postDebugImage(meta, tmpImage)
                cts.delete()
                tmpImage.delete()
            }

            otherShape.delete()
        }

        //WorkerUtil.postDebugImage(meta, thresholdedImage)

        // Clean up
        contours.delete()
        hierarchy.delete()

        return WorkerUtil.handleResponse(meta, {
            "sourceShape": {
                id: shape.id,
                points: shape.points
            },
            "foundShapes": shapes
        })
    }

    storeShape(shape) {
        if (this.getShape(shape.id)) {
            this.getShape(shape.id).delete()
        }
        ShapeDetectorWorker.shapesDict[shape.id] = shape
    }

    getShape(id) {
        return ShapeDetectorWorker.shapesDict[id]
    }

    getContours(imageData) {

        // Convert to mat
        const inputImage = cv.matFromImageData(imageData)

        // Convert to grayscale
        const grayscaleImage = OpenCvUtil.getGrayscaleImage(inputImage)

        // Blur image
        const blurredImage = new cv.Mat()
        cv.GaussianBlur(grayscaleImage, blurredImage, new cv.Size(7, 7), 0, 0, cv.BORDER_DEFAULT)

        // Threshold image
        const thresholdedImage = new cv.Mat()
        cv.adaptiveThreshold(blurredImage, thresholdedImage, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2)

        // Find contours
        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()

        cv.findContours(thresholdedImage, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

        // Clean up
        inputImage.delete()
        thresholdedImage.delete()
        blurredImage.delete()
        grayscaleImage.delete()

        return [contours, hierarchy]
    }
}


ShapeDetectorWorker.shapesDict = {}
