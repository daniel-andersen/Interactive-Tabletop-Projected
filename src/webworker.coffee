importScripts("opencv/opencv.js")
importScripts("opencv/utils.js")

dst = undefined

onmessage = (e) ->

    console.log(new Uint8ClampedArray(e.data.imageDataBuffer))
    console.log(e.data.cols + ", " + e.data.rows)
    imageData = new ImageData(new Uint8ClampedArray(e.data.imageDataBuffer), e.data.cols, e.data.rows)
    frame = cv.matFromImageData(imageData)
    console.log(frame)

    if dst?
        dst.delete()
    dst = new cv.Mat()

    cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0)
    cv.Canny(frame, dst, 50, 100, 3, false)

    frame.delete()

    postMessage({"Result": "OK!"})

console.log("Webworker initialized!")
