class BoardAreaWorker {
    getBoardArea(message) {
        let payload = message.data.payload
        let meta = message.data.meta

        let imageData = new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)

        postResponseWithImage(meta, imageData)
    }
}
