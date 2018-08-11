const moment = require('moment');

const generateLocationMessage = (from, latitude, longitude)=>{
    return{
        from,
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: moment.valueOf()
    };
};

module.exports = {generateLocationMessage};