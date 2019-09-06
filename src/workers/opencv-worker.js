console.log("Initializing new OpenCV worker...")

importScripts("/lib/opencv/opencv.js")
importScripts("/lib/opencv/utils.js")
importScripts("/scripts/workers/worker-util.js")

importScripts("/scripts/detectors/brick-detector/brick-detector-worker.js")

cv['onRuntimeInitialized'] = () => {
    ready()
}

let classMap = {
    "BrickDetector": BrickDetectorWorker
}

onmessage = (message) => {
    fireWhenReady(() => {
        meta = message.data.meta

        aClass = classMap[meta.class]
        aClassInstance = new aClass()
        aClassInstance[meta.function](message)
    })
}

console.log("OpenCV worker initialized!")
