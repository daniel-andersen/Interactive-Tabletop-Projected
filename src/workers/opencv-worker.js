console.log("Initializing new OpenCV worker...")

importScripts("/lib/opencv/opencv.js")
importScripts("/lib/opencv/utils.js")

import WorkerUtil from './worker-util.js'
import BrickDetectorWorker from '../detectors/brick-detector/brick-detector-worker'
import BoardAreaWorker from '../board-area/board-area-worker'
import BoardCalibrationWorker from '../board-calibration/board-calibration-worker'

cv['onRuntimeInitialized'] = () => {
    console.log("OpenCV worker initialized!")
    WorkerUtil.ready()
}

let classMap = {
    "BrickDetector": BrickDetectorWorker,
    "BoardArea": BoardAreaWorker,
    "BoardCalibration": BoardCalibrationWorker
}

onmessage = (message) => {
    WorkerUtil.fireWhenReady(() => {
        let meta = message.data.meta

        let aClass = classMap[meta.class]
        let aClassInstance = new aClass()

        aClassInstance[meta.function](message)
    })
}
