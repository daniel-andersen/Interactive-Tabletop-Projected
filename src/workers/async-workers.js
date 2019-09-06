class AsyncWorkers {
    constructor() {
        this.workers = []
        this.maxWorkers = 100

        this.callbackWaitQueue = []

        this.workerMap = {
            "BrickDetector": "scripts/workers/opencv-worker.js"
        }
    }

    async invokeWorker(meta, data={}, transferables=[]) {

        // Find and invoke available worker
        let worker = await this.getWorker(meta.class)
        let message = await worker.invoke(meta, data, transferables)

        // Dequeue waiting calls
        this.dequeueCallback(worker)

        return message
    }

    dequeueCallback(worker) {
        if (this.callbackWaitQueue.length <= 0) {
            return
        }

        worker.occupy()

        let callback = this.callbackWaitQueue.shift()
        callback.resolve(worker)
    }

    getWorker(className) {
        let script = this.workerMap[className]

        return new Promise((resolve, reject) => {

            // Fetch first available worker
            for (let worker of this.workers) {
                if (worker.isOfType(script) && worker.isAvailable()) {
                    worker.occupy()
                    resolve(worker)
                    return
                }
            }

            // Add worker
            if (this.canAddWorker()) {
                let worker = this.addNewWorker(script)
                worker.occupy()
                resolve(worker)
                return
            }

            // Add to wait queue
            this.callbackWaitQueue.push({resolve: resolve, reject: reject})
        })
    }

    addNewWorker(script) {
        let worker = new AsyncWorker(script)
        this.workers.push(worker)
        return worker
    }

    canAddWorker() {
        return this.workers.length < this.maxWorkers
    }
}
