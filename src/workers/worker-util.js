class WorkerUtil {
    static getImageDataFromPayload(payload) {
        return new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)
    }
}


readyCallbacks = []
isReady = false

fireWhenReady = (callback) => {
    if (isReady) {
        callback()
    } else {
        readyCallbacks.push(callback)
    }
}

ready = () => {
    isReady = true
    for (let callback of readyCallbacks) {
        callback()
    }
    readyCallbacks = []
}

postResponseWithImage = (meta, imageData, data={}, transferables=[]) => {
    postMessage({
        meta: meta,
        payload: Object.assign({},
            data,
            {
                "image": {
                    "width": imageData.width,
                    "height": imageData.height,
                    "buffer": imageData.data.buffer
                }
            }
        )
    }, transferables.concat([imageData.data.buffer]))
}

postResponse = (meta, data={}, transferables=[]) => {
    postMessage({
        meta: meta,
        payload: data
    }, transferables)
}
