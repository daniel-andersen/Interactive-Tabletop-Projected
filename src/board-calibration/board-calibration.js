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

        let callbacks = this.calibrationCallbacks
        this.calibrationCallbacks = []

        for (let callback of callbacks) {
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
        let size = Library.Sizes.p480
        let imageData = await window.library.boardArea.getImage(BoardArea.Area.CameraImage)
        let calibrationResult = await window.library.workers.invokeWorkerWithImage("BoardCalibration", "getBoardCalibration", imageData)

        this.calibrationState.calibration = calibrationResult.calibration
        this.calibrationState.lastCalibrationTime = Util.currentTimeMillis()
        console.log(this.calibrationState)

        this.debug()

        this.hideCalibrationImage().then(() => {
            this.didCalibrate()
        })
    }

    async debug() {
        //let cameraImageData = await window.library.camera.getCameraImage()
        //window.library.debugCanvas.getContext("2d").putImageData(cameraImageData, 0, 0)

        let areaImageData = await window.library.boardArea.getImage()
        window.library.debugCanvas.getContext("2d").putImageData(areaImageData, 0, 0)
    }
}
