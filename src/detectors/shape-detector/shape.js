import WorkerUtil from '../../workers/worker-util.js'
import OpenCvUtil from '../../workers/opencv-util.js'
import Util from '../../util/util.js'

export default class Shape {
    constructor(options) {
        this.id = options.id

        let contour = undefined
        if (options.inputImage) {
            this.sourceImage = OpenCvUtil.getGrayscaleImage(options.inputImage)
            contour = this.findContourFromImage(this.sourceImage)
        }
        if (options.contour) {
            contour = options.contour
        }

        this.simplifiedContour = this.simplifyContour(contour)

        this.shapeArea = cv.contourArea(this.simplifiedContour, false)
        this.shapeLength = cv.arcLength(this.simplifiedContour, true)

        this.computePoints()
        this.computeLengths()
        this.computeAngles()

        contour.delete()
    }

    findContourFromImage(inputImage) {

        // Find contours
        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()

        cv.findContours(this.sourceImage, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

        // Find largest contour
        let largestContour = undefined
        let largestContourArea = -1

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i)
            const contourArea = cv.contourArea(contour, false)

            if (contourArea > largestContourArea) {
                largestContourArea = contourArea
                largestContour = contour
            }
        }

        const contour = largestContour.clone()

        contours.delete()
        hierarchy.delete()

        return contour
    }

    simplifyContour(contour) {
        const simplifiedContour = new cv.Mat()
        cv.approxPolyDP(contour, simplifiedContour, cv.arcLength(contour, true) * 0.02, true)
        return simplifiedContour
    }

    computePoints() {
        this.points = []

        for (let i = 0; i < this.simplifiedContour.rows; i++) {
            this.points.push({
                x: this.simplifiedContour.data32S[i * 2 + 0],
                y: this.simplifiedContour.data32S[i * 2 + 1]
            })
        }
    }

    computeLengths() {
        this.lengths = []

        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i]
            const p2 = this.points[(i + 1) % this.points.length]
            const length = Util.pointsDistance(p1, p2)

            this.lengths.push({
                length: length,
                lengthPct: length / this.shapeLength
            })
        }

        console.log(this.lengths)
    }

    computeAngles() {

    }

    delete() {
        this.sourceImage.delete()
        this.sourceImage = undefined

        this.simplifiedContour.delete()
        this.simplifiedContour = undefined
    }
}
