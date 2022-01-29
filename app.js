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

dotenv.config({path: "./config.env"})
//const authController = require("./controllers/authController");
const appError = require("./utils/appError");
const errorController = require("./controllers/errorController");
const indexRouter = require('./routes/indexRoutes');
const userRouter = require('./routes/userRoutes');
const landRouter = require("./routes/local/localLandRoutes");
const {log} = require("debug");
const {sanitize} = require("express-mongo-sanitize");
const repositoryRouter = require("./routes/repositoriesRoutes");

const app = express();

// Middlewares
// helmet
app.use(helmet());
// Rate limiter
const limiter = rateLimit({
    max: 5000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "We received to many requests from you! Please try again after an hour."
});
app.use("/", limiter);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

mongoose.connect(process.env.DB_ADDRESS, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then((con) => console.log("Connection established")).catch(err => console.log(err))
app.use(logger('dev'));
//body parser
app.use(express.json({limit: "10kb"}));
// Data sanitization against noSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(hpp());

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
//serving static files
const CSP = 'Content-Security-Policy';
const POLICY =
    "default-src 'self' https://*.mapbox.com ;" +
    "base-uri 'self';block-all-mixed-content;" +
    "font-src 'self' https: data:;" +
    "frame-ancestors 'self';" +
    "img-src http://localhost:3000 'self' blob: data:;" +
    "object-src 'none';" +
    "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
    "script-src-attr 'none';" +
    "style-src 'self' https: 'unsafe-inline';" +
    'upgrade-insecure-requests;';
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
