import WorkerUtil from '../workers/worker-util.js'

export default class BoardArea {
    async getImage(areaId=BoardArea.Area.FullBoard) {
        let cameraImageData = await window.library.camera.getCameraImage()
        if (areaId === BoardArea.Area.CameraImage) {
            return cameraImageData
        }

        await window.library.boardCalibration.waitUntilCalibrated()

        let payload = await window.library.workers.invokeWorkerWithImage("BoardArea", "getBoardArea", cameraImageData, {
            area: { // TODO!
                topLeftCorner: { x: 0.0, y: 0.0 },
                bottomRightCorner: { x: 1.0, y: 1.0 }
            },
            calibration: window.library.boardCalibration.calibrationState.calibration
        })

        return WorkerUtil.getImageDataFromPayload(payload)
    }
}

BoardArea.Area = {
    CameraImage: -2,
    FullBoard: -1
}
