const mongoose = require('mongoose')

const connection = () => {
    mongoose.connect('mongodb://localhost:27017/ahmed').then(() => {
        console.log('DB Connected')
    }).catch((error) => {
        console.error('DB Connection Error:', error);
    });
}

module.exports = connection