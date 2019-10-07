import Util from './util/util'
import Config from './util/config'
import WorkerUtil from './workers/worker-util'
import AsyncWorker from './workers/async-worker'
import AsyncWorkers from './workers/async-workers'
import Camera from './camera/camera'
import BoardCalibration from './board-calibration/board-calibration'
import BoardArea from './board-area/board-area'
import BrickDetector from './detectors/brick-detector/brick-detector'
import ShapeDetector from './detectors/shape-detector/shape-detector'

export default class Library {
    init() {
        console.log("Initializing library...")

        window.config = new Config()
        window.library = this

        this.workers = new AsyncWorkers()

        this.camera = new Camera()
        this.boardCalibration = new BoardCalibration()
        this.boardArea = new BoardArea()
        this.brickDetector = new BrickDetector()
        this.shapeDetector = new ShapeDetector()

        this.debugCanvas = document.getElementById('cvDebugCanvas')

        console.log("Library initialized!")
    }

    onDebugImage(imageData) {
        if (!window.config.debug) {
            return
        }
        this.debugCanvas.getContext("2d").putImageData(imageData, 0, 0)
        this.debugCanvas.style.visibility = "visible"
    }
}

Library.Sizes = {
    Original: {
        width: 1920,
        height: 1080
    },
    p480: {
        width: 640,
        height: 480
    }
}
