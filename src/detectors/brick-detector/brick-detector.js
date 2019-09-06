class BrickDetector {
    async detect(areaId=BoardArea.Area.WholeBoard) {
        let size = Library.Sizes.p480
        let imageData = await window.library.boardArea.getImage(areaId)
        let bricks = await this._detect(imageData)
        return bricks
    }

    async _detect(imageData) {
        let bricks = await window.library.workers.invokeWorkerWithImage("BrickDetector", "detect", imageData)
        return bricks
    }
}
