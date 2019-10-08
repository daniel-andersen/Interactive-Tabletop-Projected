import ShapeDetectorWorker from '../detectors/shape-detector/shape-detector-worker.js'
import WorkerUtil from '../workers/worker-util.js'

export default class BoardCalibrationWorker {
    getBoardCalibration(message) {
        const payload = message.data.payload
        const meta = message.data.meta

        // Detect shape
        const detectionResult = new ShapeDetectorWorker().detect({
            data: {
                meta: Object.assign({}, meta, {functionCall: true}),
                payload: {
                    image: payload.image,
                    shape: payload.shape
                }
            }
        })
        if (detectionResult.foundShapes.length !== 1) {
            return WorkerUtil.handleResponse(meta, {
                success: false
            })
        }

        const shape = detectionResult.foundShapes[0]

        // Find perspective transform
        const homography = this.findHomography(detectionResult.sourceShape.points, shape.points)
        const corners = this.findCorners(homography)
        const perspectiveTransform = this.findPerspectiveTransform(corners)

        homography.delete()

        return WorkerUtil.handleResponse(meta, {
            success: true,
            calibration: {
                corners: corners,
                perspectiveTransform: perspectiveTransform
            }
        })
    }

    findHomography(calibrationPoints, foundPoints) {

        // Convert calibration points to mat
        const flatCalibrationPoints = []
        for (let i = 0; i < calibrationPoints.length; i++) {
            flatCalibrationPoints.push(calibrationPoints[i].x)
            flatCalibrationPoints.push(calibrationPoints[i].y)
        }
        const calibrationPointsMat = cv.matFromArray(9, 1, cv.CV_32FC2, flatCalibrationPoints)

        // Convert found points to mat
        const flatFoundPoints = []
        for (let i = 0; i < foundPoints.length; i++) {
            flatFoundPoints.push(foundPoints[i].x)
            flatFoundPoints.push(foundPoints[i].y)
        }
        const foundPointsMat = cv.matFromArray(9, 1, cv.CV_32FC2, flatFoundPoints)

        const homography = cv.findHomography(calibrationPointsMat, foundPointsMat)

        foundPointsMat.delete()
        calibrationPointsMat.delete()

        return homography
    }

    findCorners(homography) {
        const borderPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            1280 - 1, 0,
            1280 - 1, 800 - 1,
            0, 800 - 1
        ])  // TODO! Extract size from elsewhere!

        var perspectiveTransform = new cv.Mat(4, 1, cv.CV_32FC2)
        cv.perspectiveTransform(borderPoints, perspectiveTransform, homography)

        const corners = {
            topLeftCorner: {x: perspectiveTransform.data32F[0*2 + 0], y: perspectiveTransform.data32F[0*2 + 1]},
            topRightCorner: {x: perspectiveTransform.data32F[1*2 + 0], y: perspectiveTransform.data32F[1*2 + 1]},
            bottomRightCorner: {x: perspectiveTransform.data32F[2*2 + 0], y: perspectiveTransform.data32F[2*2 + 1]},
            bottomLeftCorner: {x: perspectiveTransform.data32F[3*2 + 0], y: perspectiveTransform.data32F[3*2 + 1]}
        }

        borderPoints.delete()
        perspectiveTransform.delete()

        return corners
    }

    findPerspectiveTransform(corners) {
        const aspectRatio = 1280.0 / 800.0
        const maxWidth = Math.max(corners.topRightCorner.x - corners.topLeftCorner.x, corners.bottomRightCorner.x - corners.bottomLeftCorner.x)
        const transformSize = {
            width: maxWidth,
            height: maxWidth / aspectRatio
        }

        const sourceCorners = cv.matFromArray(4, 1, cv.CV_32FC2, [
            corners.topLeftCorner.x, corners.topLeftCorner.y,
            corners.topRightCorner.x, corners.topRightCorner.y,
            corners.bottomRightCorner.x, corners.bottomRightCorner.y,
            corners.bottomLeftCorner.x, corners.bottomLeftCorner.y
        ])

        const destCorners = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            transformSize.width, 0,
            transformSize.width, transformSize.height,
            0, transformSize.height
        ])

        const perspectiveTransform = cv.getPerspectiveTransform(sourceCorners, destCorners)

        const matrixEntries = [
            perspectiveTransform.data64F[0], perspectiveTransform.data64F[1], perspectiveTransform.data64F[2],
            perspectiveTransform.data64F[3], perspectiveTransform.data64F[4], perspectiveTransform.data64F[5],
            perspectiveTransform.data64F[6], perspectiveTransform.data64F[7], perspectiveTransform.data64F[8]]

        sourceCorners.delete()
        destCorners.delete()
        perspectiveTransform.delete()

        return {
            size: transformSize,
            matrix: matrixEntries
        }
    }
}
