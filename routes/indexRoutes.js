const express = require('express');
const router = express.Router();
const path = require("path");
const authController = require("../controllers/authController");
/* GET home page. */

router.post('/signup', function (req, res, next) {
    authController.signup(req, res, next);
});

router.route("/login").post(function (req, res, next) {
    authController.login(req, res, next);
}).get(function (req, res, next) {
    res.status(200).sendFile(path.resolve(__dirname + '/../public/login.html'));
});
router.get("/static/js/:name", function (req, res, next) {
    res.sendFile(__dirname + `/../public/static/js/${req.params.name}`);
})
router.get("/static/css/:name", function (req, res, next) {
    res.sendFile(__dirname + `/../public/static/css/${req.params.name}`);
})
router.route('/forgotPassword')
    .get(function (req, res, next) {
        res.status(203).json({message: "Not implemented"});
    })
    .post(function (req, res, next) {
        authController.forgotPassword(req, res, next);
    });
router.patch("/resetPassword/:token", function (req, res, next) {
    authController.resetPassword(req, res, next);
});
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.route("/test123").get( function (req,res,next) {
    res.status(210).json({ "type": "FeatureCollection",
        "features": [
            { "type": "Feature",
                "id": "random",
                "properties": {
                    "description": "<p>This is Sacramento</p>"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-121.37881303595779,38.39168793390614],[-121.37881303595779,38.39168793390614],[-121.37881303595779,38.39168793390614],[-121.42144609259859,38.3858743352733],[-121.48040890184362,38.39168793390614],[-121.51616899298959,38.444811306302185],[-121.58203060594559,38.4678848333205],[-121.5930118478076,38.626428127591964],[-121.46772233771595,38.671102403308296],[-121.39491024461671,38.75068410903778],[-121.31532853888723,38.82349620213702],[-121.23913163947286,38.82349620213702],[-121.19226111538413,38.73701569269657],[-121.13750993537089,38.65836416274834],[-121.19386308478518,38.61312144627681],[-121.26453060594432,38.58219310155013],[-121.32057369676485,38.53666616470099],[-121.37881303595779,38.4933096380081],[-121.37062232143953,38.43667226821621],[-121.37881303595779,38.39168793390614]]]

                }
            },

        ]
    });
}).post(function (req,res,next) {
    res.status(200).json({message: "emirhanın amına koyyyyyim"});

});

router.get("/test31", function (req,res,next) {
    res.status(200).sendFile(path.resolve(__dirname + '/../public/test.html'));
});
module.exports = router;
