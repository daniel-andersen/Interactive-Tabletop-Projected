class BoardCalibrationWorker {
    getBoardCalibration(message) {
        let payload = message.data.payload
        let meta = message.data.meta

        let imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)

        let homography = this.findHomography(imageData)
        let corners = this.findCorners(homography)
        let perspectiveTransform = this.findPerspectiveTransform(corners)

        homography.delete()

        postResponse(meta, {
            calibration: {
                corners: corners,
                perspectiveTransform: perspectiveTransform
            }
        })
    }

    findHomography(imageData) {
        let foundPoints = cv.matFromArray(9, 1, cv.CV_32FC2, [264, 250,   553,  41,    793, 253,    770, 403,   1016, 508,   301, 440,   549, 398,   641, 246,   559, 119])
        let calibrationPoints = cv.matFromArray(9, 1, cv.CV_32FC2, [583, 389,   872, 181,   1113, 393,   1088, 543,   1336, 647,   619, 579,   868, 538,   960, 387,   878, 260])

        let homography = cv.findHomography(foundPoints, calibrationPoints)

        foundPoints.delete()
        calibrationPoints.delete()

        return homography
    }

    findCorners(homography) {
        let borderPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            1280 - 1, 0,
            1280 - 1, 800 - 1,
            0, 800 - 1
        ])  // TODO! Extract size from elsewhere!

        var perspectiveTransform = new cv.Mat(4, 1, cv.CV_32FC2)
        cv.perspectiveTransform(borderPoints, perspectiveTransform, homography)

        let corners = {
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
        let transformSize = {
            width: Math.max(corners.topRightCorner.x - corners.topLeftCorner.x, corners.bottomRightCorner.x - corners.bottomLeftCorner.x),
            height: Math.max(corners.bottomLeftCorner.y - corners.topLeftCorner.y, corners.bottomRightCorner.y - corners.topRightCorner.y)
        }

        let sourceCorners = cv.matFromArray(4, 1, cv.CV_32FC2, [
            corners.topLeftCorner.x, corners.topLeftCorner.y,
            corners.topRightCorner.x, corners.topRightCorner.y,
            corners.bottomRightCorner.x, corners.bottomRightCorner.y,
            corners.bottomLeftCorner.x, corners.bottomLeftCorner.y
        ])

        let destCorners = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            transformSize.width, 0,
            transformSize.width, transformSize.height,
            0, transformSize.height
        ])

        let perspectiveTransform = cv.getPerspectiveTransform(sourceCorners, destCorners)

        let matrixEntries = [
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
