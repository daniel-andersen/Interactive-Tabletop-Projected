import BoardArea from '../../board-area/board-area'
import Library from '../../library'

export default class BrickDetector {
    async detect(areaId=BoardArea.Area.FullBoard) {
        await window.library.boardCalibration.waitUntilCalibrated()

        let size = Library.Sizes.p480
        let imageData = await window.library.boardArea.getImage(areaId)

        let bricks = await window.library.workers.invokeWorkerWithImage("BrickDetector", "detect", imageData)

        return bricks
    }
}
