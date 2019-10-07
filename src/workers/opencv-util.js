export default class OpenCvUtil {
    static getGrayscaleImage(inputImage) {
        if (inputImage.type() == cv.CV_8UC1) {
            return inputImage.clone()
        } else {
            const grayscaleImage = new cv.Mat()
            cv.cvtColor(inputImage, grayscaleImage, cv.COLOR_RGBA2GRAY, 0)
            return grayscaleImage
        }
    }

    static getColorImage(inputImage) {
        if (inputImage.type() == cv.CV_8UC1) {
            const colorImage = new cv.Mat()
            cv.cvtColor(inputImage, colorImage, cv.COLOR_GRAY2RGBA, 0)
            return colorImage
        } else {
            return inputImage.clone()
        }
    }
}
