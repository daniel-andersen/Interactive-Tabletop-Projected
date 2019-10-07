import AsyncWorker from './async-worker'

export default class AsyncWorkers {
    constructor() {
        this.workers = []
        this.maxWorkers = 100

        this.callbackWaitQueue = []

        this.workerMap = {
            "ShapeDetector": "OpenCvWorker",
            "BrickDetector": "OpenCvWorker",
            "BoardArea": "OpenCvWorker",
            "BoardCalibration": "OpenCvWorker"
        }
    }

    async invokeWorkerWithImage(className, functionName, imageData, data={}) {
        const imageDataArray = new Uint8ClampedArray(imageData.width * imageData.height * 4)
        imageDataArray.set(imageData.data)

        return this.invokeWorker(
            {
                "class": className,
                "function": functionName
            },
            Object.assign({},
                data,
                {
                    "image": {
                        "width": imageData.width,
                        "height": imageData.height,
                        "buffer": imageDataArray.buffer
                    }
                }
            ),
            [imageDataArray.buffer]
        )
    }

    async invokeWorker(meta, data={}, transferables=[]) {

        // Find and invoke available worker
        const worker = await this.getWorker(meta.class)
        const message = await worker.invoke(meta, data, transferables)

        // Dequeue waiting calls
        this.dequeueCallback(worker)

        return message
    }

    dequeueCallback(worker) {
        if (this.callbackWaitQueue.length <= 0) {
            return
        }

        worker.occupy()

        const callback = this.callbackWaitQueue.shift()
        callback.resolve(worker)
    }

    getWorker(className) {
        const workerClass = this.workerMap[className]

        return new Promise((resolve, reject) => {

            // Fetch first available worker
            for (const worker of this.workers) {
                if (worker.isOfType(workerClass) && worker.isAvailable()) {
                    worker.occupy()
                    resolve(worker)
                    return
                }
            }

            // Add worker
            if (this.canAddWorker()) {
                const worker = this.addNewWorker(workerClass)
                worker.occupy()
                resolve(worker)
                return
            }

            // Add to wait queue
            this.callbackWaitQueue.push({resolve: resolve, reject: reject})
        })
    }

    addNewWorker(script) {
        const worker = new AsyncWorker(script)
        this.workers.push(worker)
        return worker
    }

    canAddWorker() {
        return this.workers.length < this.maxWorkers
    }
}
