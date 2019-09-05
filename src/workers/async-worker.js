class AsyncWorker {
    constructor(script) {
        this.script = script
        this.busy = true
        this.isReusable = true

        this.worker = new Worker(script)
        this.worker.onmessage = (message) => {
            this.onMessage(message)
        }

        this.promises = {}
    }

    isOfType(script) {
        return this.script === script
    }

    isAvailable() {
        return this.isReusable || !this.busy
    }

    occupy() {
        this.busy = true
    }

    invoke(data={}, transferables=[]) {
        this.occupy()

        return new Promise((resolve, reject) => {
            let meta = {
                callerId: Util.randomId()
            }

            this.promises[meta.callerId] = {
                resolve: resolve,
                reject: reject
            }

            this.worker.postMessage({
                meta: meta,
                payload: data
            }, transferables)
        })
    }

    onMessage(message) {
        this.busy = false

        let resolve = this.promises[message.data.meta.callerId].resolve
        delete this.promises[message.data.meta.callerId]

        resolve(message.data.payload)
    }
}
