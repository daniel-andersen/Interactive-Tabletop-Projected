import * as OpenCvWorker from 'workerize-loader!./opencv-worker.js'
import WorkerUtil from './worker-util.js'
import Util from '../util/util'

export default class AsyncWorker {
    constructor(workerClass) {
        this.workerMap = {
            "OpenCvWorker": OpenCvWorker
        }

        this.busy = true
        this.isReusable = true

        this.workerClass = workerClass
        this.worker = this.workerMap[workerClass]()
        this.worker.onmessage = (message) => {
            this.onMessage(message)
        }

        this.promises = {}
    }

    isOfType(workerClass) {
        return this.workerClass === workerClass
    }

    isAvailable() {
        return this.isReusable || !this.busy
    }

    occupy() {
        this.busy = true
    }

    invoke(meta, data={}, transferables=[]) {
        this.occupy()

        return new Promise((resolve, reject) => {
            meta.callerId = Util.randomId()

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
        if (message.data.type && message.data.type === "RPC") {
            return
        }
        if (message.data.type && message.data.type === "debug") {
            window.library.onDebugImage(WorkerUtil.getImageDataFromPayload(message.data.payload))
            return
        }

        this.busy = false

        const resolve = this.promises[message.data.meta.callerId].resolve
        delete this.promises[message.data.meta.callerId]

        resolve(message.data.payload)
    }
}
