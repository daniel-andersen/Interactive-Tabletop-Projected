console.log("Initializing new BrickDetector worker...")

importScripts("/lib/opencv/opencv.js")
importScripts("/lib/opencv/utils.js")
importScripts("/scripts/workers/worker-util.js")

cv['onRuntimeInitialized'] = () => {
    ready()
}

onmessage = (e) => {
    fireWhenReady(() => {
        payload = e.data.payload
        meta = e.data.meta

        imageData = new ImageData(new Uint8ClampedArray(payload.imageDataBuffer), payload.width, payload.height)
        frame = cv.matFromImageData(imageData)

        dst = new cv.Mat()

        cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0)
        cv.Canny(frame, dst, 50, 100, 3, false)

        frame.delete()
        dst.delete()

        postResponse(meta, {bricks: []})
    })
}

console.log("BrickDetector worker initialized!")
