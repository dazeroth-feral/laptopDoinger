// підключення бібліотек
const screenshot = require('desktop-screenshot');

// ф-ція, котра робить скріншот
const saveScreenshot = (fileName) => {
    screenshot(`${fileName}`, function (error, complete) {
        if (error) {
            console.error('Помилка при захопленні знімка екрану:', error);
        } else {
            console.log('Знімок екрану збережено у файлі screenshot.png');
        }
    });
}

module.exports = {
    saveScreenshot
}