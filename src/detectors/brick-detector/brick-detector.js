class BrickDetector {
    async detect() {
        let size = Library.Sizes.p480
        let imageData = window.library.getImageData(size)
        return await this._detect(imageData)
    }

    async _detect(imageData) {
        let bricks = await window.library.workers.invokeWorker(
            "scripts/detectors/brick-detector/brick-detector-worker.js",
            {
                "width": imageData.width,
                "height": imageData.height,
                "imageDataBuffer": imageData.data.buffer
            },
            [imageData.data.buffer]
        )
        return bricks
    }
}
