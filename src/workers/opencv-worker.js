console.log("Initializing new OpenCV worker...")

importScripts("/lib/opencv/opencv.js")
importScripts("/lib/opencv/utils.js")

import WorkerUtil from './worker-util.js'
import ShapeDetectorWorker from '../detectors/shape-detector/shape-detector-worker'
import BrickDetectorWorker from '../detectors/brick-detector/brick-detector-worker'
import BoardAreaWorker from '../board-area/board-area-worker'
import BoardCalibrationWorker from '../board-calibration/board-calibration-worker'

cv['onRuntimeInitialized'] = () => {
    console.log("OpenCV worker initialized!")
    WorkerUtil.ready()
}

const classMap = {
    "ShapeDetector": ShapeDetectorWorker,
    "BrickDetector": BrickDetectorWorker,
    "BoardArea": BoardAreaWorker,
    "BoardCalibration": BoardCalibrationWorker
}

onmessage = (message) => {
    WorkerUtil.fireWhenReady(() => {
        const meta = message.data.meta

        const aClass = classMap[meta.class]
        const aClassInstance = new aClass()

        aClassInstance[meta.function](message)
    })
}
