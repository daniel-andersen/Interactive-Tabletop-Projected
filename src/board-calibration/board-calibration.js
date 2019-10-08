import Library from '../library'
import BoardArea from '../board-area/board-area'
import Util from '../util/util'

export default class BoardCalibration {
    constructor() {
        this.shapeDetectorId = "board_calibrator"
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
            this.initializeCalibration().then(() => {
                this.performCalibrationStep()
            })
        })
    }

    async initializeCalibration() {
        await window.library.shapeDetector.createShape(this.shapeDetectorId, "/assets/library/calibration/calibration.png")
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
        if (this.boardCalibrationDiv) {
            document.body.removeChild(this.boardCalibrationDiv)
            this.boardCalibrationDiv = undefined
        }

        this.boardCalibrationDiv = document.createElement('div')
        this.boardCalibrationDiv.style.background = '#000000'
        this.boardCalibrationDiv.style.position = 'fixed'
        this.boardCalibrationDiv.style.left = '0%'
        this.boardCalibrationDiv.style.top = '0%'
        this.boardCalibrationDiv.style.width = '100%'
        this.boardCalibrationDiv.style.height = '100%'
        this.boardCalibrationDiv.style.opacity = '0'
        this.boardCalibrationDiv.style.transition = 'opacity 1s linear'
        this.boardCalibrationDiv.style.zIndex = 1000
        document.body.appendChild(this.boardCalibrationDiv)

        const image = document.createElement('img')
        image.src = '/assets/library/calibration/calibration.png'
        image.style.objectFit = 'contain'
        image.style.position = 'fixed'
        image.style.left = '0%'
        image.style.top = '0%'
        image.style.width = '100%'
        image.style.height = '100%'
        this.boardCalibrationDiv.appendChild(image)

        setTimeout(() => {
            this.boardCalibrationDiv.style.opacity = '1'
        }, 100)

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1500)
        })
    }

    hideCalibrationImage() {
        this.boardCalibrationDiv.style.opacity = '0'

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.boardCalibrationDiv) {
                    document.body.removeChild(this.boardCalibrationDiv)
                    this.boardCalibrationDiv = undefined
                }

                resolve()
            }, 1100)
        })
    }

    async performCalibrationStep() {
        const size = Library.Sizes.p480
        const imageData = await window.library.boardArea.getImage(BoardArea.Area.CameraImage)
        const calibrationResult = await window.library.workers.invokeWorkerWithImage("BoardCalibration", "getBoardCalibration", imageData, {
            shape: {
                id: this.shapeDetectorId
            }
        })

        if (!calibrationResult.success) {
            console.log("Not successful!")
            setTimeout(() => {
                this.performCalibrationStep()
            }, 1000)
            return
        }

        this.calibrationState.calibration = calibrationResult.calibration
        this.calibrationState.lastCalibrationTime = Util.currentTimeMillis()

        this.hideCalibrationImage().then(() => {
            this.didCalibrate()
        })
    }
}
