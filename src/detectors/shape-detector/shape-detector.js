import BoardArea from '../../board-area/board-area'
import Library from '../../library'
import Util from '../../util/util'

export default class ShapeDetector {
    async createShape(id, imageUrl) {
        const image = await Util.loadImage(imageUrl)
        const imageData = await Util.getImageData(image)

        const result = await window.library.workers.invokeWorkerWithImage("ShapeDetector", "createShape", imageData, {
            shape: {
                id: id
            }
        })

        return result
    }

    async detect(id, areaId=BoardArea.Area.FullBoard) {
        await window.library.boardCalibration.waitUntilCalibrated()

        const size = Library.Sizes.p480
        const imageData = await window.library.boardArea.getImage(areaId)

        const result = await window.library.workers.invokeWorkerWithImage("ShapeDetector", "detect", imageData, {
            shape: {
                id: id
            }
        })

        return result
    }
}
