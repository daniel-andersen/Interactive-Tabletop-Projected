import BoardArea from '../../board-area/board-area'
import Library from '../../library'

export default class BrickDetector {
    async detect(areaId=BoardArea.Area.FullBoard) {
        await window.library.boardCalibration.waitUntilCalibrated()

        const size = Library.Sizes.p480
        const imageData = await window.library.boardArea.getImage(areaId)

        const bricks = await window.library.workers.invokeWorkerWithImage("BrickDetector", "detect", imageData)

        return bricks
    }
}
