class BoardArea {
    async getImage(areaId=Area.WholeBoard) {
        let cameraImageData = await window.library.camera.getCameraImage()
        let payload = await window.library.workers.invokeWorkerWithImage("BoardArea", "getBoardArea", cameraImageData, {"areaId": areaId})

        console.log(WorkerUtil.getImageDataFromPayload(payload))
        return WorkerUtil.getImageDataFromPayload(payload)
    }
}

BoardArea.Area = {
    WholeBoard: 0
}
