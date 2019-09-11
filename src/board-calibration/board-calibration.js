class BoardCalibration {
    calibrated = false
    calibrating = false
    lastCalibrationTime = undefined

    calibrationCallbacks = []

    calibration = {
        topLeftCorner: new Point2i(),
        topRightCorner: new Point2i(),
        bottomLeftCorner: new Point2i(),
        bottomRightCorner: new Point2i()
    }

    waitUntilCalibrated() {
        return new Promise((resolve, reject) => {
            if (this.isCalibrated()) {
                resolve()
                return
            }

            this.addCalibrationCallback(() => resolve())
            this.startCalibration()
        })
    }

    isCalibrated() {
        return this.calibrated
    }

    needsCalibration() {
        return !this.calibrated
    }

    addCalibrationCallback(callback) {
        this.calibrationCallbacks.push(callback)
    }

    startCalibration() {
        if (this.calibrating) {
            return
        }

        this.calibrating = true

        console.log("Starting calibration...")
        setTimeout(() => {
            this.didCalibrate()
        }, 2000)
    }

    didCalibrate() {
        console.log("Finished calibration!")

        this.calibrating = false
        this.calibrated = true

        let callbacks = this.calibrationCallbacks
        this.calibrationCallbacks = []

        for (let callback of callbacks) {
            callback()
        }
    }
}
