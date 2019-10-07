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

        WorkerUtil.postResponse(meta, {
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
        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i)
            const otherShape = new Shape({contour: contour})
        }

        //WorkerUtil.postDebugImage(meta, thresholdedImage)

        // Clean up
        contours.delete()
        hierarchy.delete()

        WorkerUtil.postResponse(meta, {
            "shapes": []
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
