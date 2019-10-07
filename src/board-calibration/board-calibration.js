import Library from '../library'
import BoardArea from '../board-area/board-area'
import Util from '../util/util'

export default class BoardCalibration {
    constructor() {
        this.calibrationCallbacks = []

        this.calibrationState = {
            calibrated: false,
            calibrating: false,
            lastCalibrationTime: undefined,
            calibration: undefined
        }
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
        return this.calibrationState.calibrated
    }

    needsCalibration() {
        return !this.calibrationState.calibrated
    }

    addCalibrationCallback(callback) {
        this.calibrationCallbacks.push(callback)
    }

    startCalibration() {
        if (this.calibrationState.calibrating) {
            return
        }

        this.calibrationState.calibrating = true
        this.calibrationState.calibrated = false

        console.log("Starting calibration...")

        this.showCalibrationImage().then(() => {
            this.performCalibrationStep()
        })
    }

    didCalibrate() {
        console.log("Finished calibration!")

        this.calibrationState.calibrating = false
        this.calibrationState.calibrated = true

        const callbacks = this.calibrationCallbacks
        this.calibrationCallbacks = []

        for (const callback of callbacks) {
            callback()
        }
    }

    showCalibrationImage() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1000)
        })
    }

    hideCalibrationImage() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1000)
        })
    }

    async performCalibrationStep() {
        const size = Library.Sizes.p480
        const imageData = await window.library.boardArea.getImage(BoardArea.Area.CameraImage)
        const calibrationResult = await window.library.workers.invokeWorkerWithImage("BoardCalibration", "getBoardCalibration", imageData)

        this.calibrationState.calibration = calibrationResult.calibration
        this.calibrationState.lastCalibrationTime = Util.currentTimeMillis()

        this.hideCalibrationImage().then(() => {
            this.didCalibrate()
        })
    }
}
