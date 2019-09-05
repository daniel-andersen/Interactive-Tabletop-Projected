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

postResponse = (meta, data) => {
    postMessage({
        meta: meta,
        payload: data
    })
}
