const i18n = require('i18n');
const path = require('path');

i18n.configure({
    locales: ['en',"tr"],
    directory: path.join(__dirname + '/../locales'),
    defaultLocale: 'en',
    cookie: 'lang',
});
module.exports = i18n