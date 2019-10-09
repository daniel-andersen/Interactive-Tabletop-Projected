import WorkerUtil from '../workers/worker-util.js'

export default class BoardArea {
    async getImage(areaId=BoardArea.Area.FullBoard) {
        const imageData = await window.library.camera.getCameraImage()
        if (areaId === BoardArea.Area.CameraImage) {
            return imageData
        }

        await window.library.boardCalibration.waitUntilCalibrated()

        const payload = await window.library.workers.invokeWorkerWithImage("BoardArea", "getBoardArea", imageData, {
            area: { // TODO!
                topLeftCorner: { x: 0.0, y: 0.0 },
                bottomRightCorner: { x: 1.0, y: 1.0 }
            },
            calibration: window.library.boardCalibration.calibrationState.calibration
        })

        window.library.debugCanvas.getContext("2d").clearRect(0, 0, window.library.debugCanvas.width, window.library.debugCanvas.height)
        window.library.debugCanvas.getContext("2d").putImageData(imageData, 0, 0)
        window.library.debugCanvas.style.visibility = "visible"

        return WorkerUtil.getImageDataFromPayload(payload)
    }
}

BoardArea.Area = {
    CameraImage: -2,
    FullBoard: -1
}
