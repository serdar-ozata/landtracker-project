const dotenv = require("dotenv");
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose")
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");

dotenv.config({path: "./config.env"})
//const authController = require("./controllers/authController");
const i18n = require("./utils/language");
const appError = require("./utils/appError");
const errorController = require("./controllers/errorController");
const indexRouter = require('./routes/indexRoutes');
const userRouter = require('./routes/userRoutes');
const {log} = require("debug");
const {sanitize} = require("express-mongo-sanitize");
const repositoryRouter = require("./routes/repositoriesRoutes");
const User = require("./models/userModel");

const app = express();

// Middlewares
// helmet
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));
// Rate limiter
const limiter = rateLimit({
    max: 5000,
    windowMs: 30 * 60 * 1000, // 30 minutes
    message: "We received to many requests from you! Please try again after an hour."
});
app.use(limiter);

console.log("launched on " + process.env.NODE_ENV + "mode")

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

mongoose.connect(process.env.DB_ADDRESS, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then((con) => {
    console.log("Connection established");
    // User.find().where("email").gte(0).exec().then(list => {
    //     list.forEach(async user => {
    //         user.activated = true;
    //         await user.save({validateBeforeSave: false});
    //     })
    // });
}).catch(err => {
    console.error("MongoDB Connection error")
    console.log(err)
})
app.use(logger('dev'));
//body parser
app.use(express.json({limit: "10kb"}));
// Data sanitization against noSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(hpp());
//app.use(compression());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(i18n.init);
//serving static files
const CSP = 'Content-Security-Policy';
const POLICY =
    "font-src 'self' https: data:;" +
    "frame-ancestors 'self';" +
    "img-src 'self' blob: data:;"

app.use((req, res, next) => {
    res.setHeader(CSP, POLICY);
    next();
});
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/user', userRouter);
app.use("/repository", repositoryRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(new appError("Could not find the page " + req.originalUrl, 404))
});


// error handler
app.use(errorController);


module.exports = app;
