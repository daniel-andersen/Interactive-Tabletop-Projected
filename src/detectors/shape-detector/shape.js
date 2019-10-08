import WorkerUtil from '../../workers/worker-util.js'
import OpenCvUtil from '../../workers/opencv-util.js'
import Util from '../../util/util.js'

export default class Shape {
    constructor(options) {
        this.id = options.id
        this.options = options

        let contour = undefined
        if (this.options.inputImage) {
            this.options.inputImage = OpenCvUtil.getGrayscaleImage(this.options.inputImage)
            contour = this.findContourFromImage(this.options.inputImage)
        }
        if (this.options.contour) {
            contour = this.options.contour.clone()
        }

        this.simplifiedContour = this.simplifyContour(contour)

        contour.delete()

        this.shapeArea = cv.contourArea(this.simplifiedContour, false)
        this.shapeLength = cv.arcLength(this.simplifiedContour, true)

        this.computePoints()
    }

    compare(otherShape) {

        // Compare number of points in simplified contour
        if (this.points.length != otherShape.points.length) {
            return {match: false}
        }

        let offset = 0

        // Compare lengths
        this.computeLengths()
        otherShape.computeLengths()

        for (let i = 0; i < this.lengths.length; i++) {
            const index = (i + offset) % this.lengths.length
            const deltaLength = Math.abs(this.lengths[index] - otherShape.lengths[index])
            const maxDeviation = this.lengths[index] * 0.1  // TODO!

            if (deltaLength > maxDeviation) {
                return {match: false}
            }
        }

        // Compare angles
        this.computeAngles()
        otherShape.computeAngles()

        for (let i = 0; i < this.angles.length; i++) {
            const index = (i + offset) % this.angles.length
            const deltaAngle = Math.abs(Util.angleDifference(this.angles[index], otherShape.angles[index]))
            const maxDeviation = Math.PI * 0.1  // TODO!

            if (deltaAngle > maxDeviation) {
                return {match: false}
            }
        }

        // Calculate matched points, in order
        const matchedPoints = []

        for (let i = 0; i < otherShape.points.length; i++) {
            const index = (i + offset) % otherShape.points.length
            matchedPoints.push(otherShape.points[index])
        }

        return {
            match: true,
            shape: {
                id: otherShape.id,
                points: matchedPoints
            }
        }
    }

    findContourFromImage(inputImage) {

        // Find contours
        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()

        cv.findContours(this.options.inputImage, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

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
        if (this.points) {
            return
        }

        this.points = []

        for (let i = 0; i < this.simplifiedContour.rows; i++) {
            this.points.push({
                x: this.simplifiedContour.data32S[i * 2 + 0],
                y: this.simplifiedContour.data32S[i * 2 + 1]
            })
        }
    }

    computeLengths() {
        if (this.lengths) {
            return
        }

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
    }

    computeAngles() {
        if (this.angles) {
            return
        }

        this.angles = []

        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[((i - 1) + this.points.length) % this.points.length]
            const p2 = this.points[i]
            const p3 = this.points[(i + 1) % this.points.length]
            const angle = Util.pointsAngle(p1, p2, p3)

            this.angles.push(angle)
        }
    }

    delete() {
        if (this.options.inputImage) {
            this.options.inputImage.delete()
            this.options.inputImage = undefined
        }

        if (this.simplifiedContour) {
            this.simplifiedContour.delete()
            this.simplifiedContour = undefined
        }
    }
}
