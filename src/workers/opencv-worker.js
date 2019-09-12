console.log("Initializing new OpenCV worker...")

importScripts("/lib/opencv/opencv.js")
importScripts("/lib/opencv/utils.js")
importScripts("/scripts/workers/worker-util.js")

importScripts("/scripts/detectors/brick-detector/brick-detector-worker.js")
importScripts("/scripts/board-area/board-area-worker.js")
importScripts("/scripts/board-calibration/board-calibration-worker.js")

cv['onRuntimeInitialized'] = () => {
    console.log("OpenCV worker initialized!")
    ready()
}

let classMap = {
    "BrickDetector": BrickDetectorWorker,
    "BoardArea": BoardAreaWorker,
    "BoardCalibration": BoardCalibrationWorker
}

onmessage = (message) => {
    fireWhenReady(() => {
        meta = message.data.meta

        aClass = classMap[meta.class]
        aClassInstance = new aClass()
        aClassInstance[meta.function](message)
    })
}
