class BoardArea {
    async getImage(areaId=Area.FullBoard) {
        let cameraImageData = await window.library.camera.getCameraImage()

        if (areaId === Area.CameraImage) {
            return cameraImageData
        }

        let payload = await window.library.workers.invokeWorkerWithImage("BoardArea", "getBoardArea", cameraImageData, {"areaId": areaId})

        return WorkerUtil.getImageDataFromPayload(payload)
    }
}

BoardArea.Area = {
    CameraImage: -2,
    FullBoard: -1
}
