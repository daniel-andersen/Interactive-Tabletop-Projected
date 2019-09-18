import Util from './util/util'
import Config from './util/config'
import WorkerUtil from './workers/worker-util'
import AsyncWorker from './workers/async-worker'
import AsyncWorkers from './workers/async-workers'
import Camera from './camera/camera'
import BoardCalibration from './board-calibration/board-calibration'
import BoardArea from './board-area/board-area'
import BrickDetector from './detectors/brick-detector/brick-detector'

class Library {
    init() {
        console.log("Initializing library...")

        window.config = new Config()
        window.library = this

        this.workers = new AsyncWorkers()

        this.camera = new Camera()
        this.boardCalibration = new BoardCalibration()
        this.boardArea = new BoardArea()
        this.brickDetector = new BrickDetector()

        this.debugCanvas = document.getElementById('cvDebugCanvas')

        console.log("Library initialized!")
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

export default Library
