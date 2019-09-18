export default class WorkerUtil {
    static getImageDataFromPayload(payload) {
        return new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)
    }
}


WorkerUtil.readyCallbacks = []
WorkerUtil.isReady = false

WorkerUtil.fireWhenReady = (callback) => {
    if (WorkerUtil.isReady) {
        callback()
    } else {
        WorkerUtil.readyCallbacks.push(callback)
    }
}

WorkerUtil.ready = () => {
    WorkerUtil.isReady = true
    for (let callback of WorkerUtil.readyCallbacks) {
        callback()
    }
    WorkerUtil.readyCallbacks = []
}

WorkerUtil.postResponseWithImage = (meta, imageData, data={}, transferables=[]) => {
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

WorkerUtil.postResponse = (meta, data={}, transferables=[]) => {
    postMessage({
        meta: meta,
        payload: data
    }, transferables)
}
