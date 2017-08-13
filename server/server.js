// Set up
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
var moment = require('moment');
require('mongoose-moment')(mongoose);

var databaseConfig = require('./config/database');
var router = require('./app/routes')

 
// Configuration
//mongoose.connect('mongodb://localhost/userProgress');
mongoose.connect(databaseConfig.url);
 
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());

router(app);
 
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
 


    // Models
var UserProgress = mongoose.model('userProgress', {
    date: {type: Date, 
            required: true,
            default: Date.now },
    photoUrl: {type: String, required: true, unique: true},
    weight: {type: Number, required: true, min: 1}
});
    // Routes
 
    // Get reviews
    app.get('/api/progress', function(req, res) {
 
        console.log("fetching progress posts");
 
        // use mongoose to get all reviews in the database
        UserProgress.find(function(err, progress) {
 
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
 
            res.json(progress); // return all reviews in JSON format
        });
    });
 
    // create review and send back all reviews after creation
    app.post('/api/progress', function(req, res) {
 
        console.log("creating review");
 
        // create a review, information comes from request from Ionic
        UserProgress.create({
            date : req.body.date,
            photoUrl : req.body.photoUrl,
            weight: req.body.weight,
            done : false
        }, function(err, progress) {
            if (err)
                res.send(err);
 
            // get and return all the reviews after you create another
            UserProgress.find(function(err, progress) {
                if (err)
                    res.send(err)
                res.json(progress);
            });
        });
 
    });
 
    // delete a review
    app.delete('/api/progress/:progress_id', function(req, res) {
        UserProgress.remove({
            _id : req.params.progress_id
        }, function(err, progress) {
 
        });
    });
 

 
 
// listen (start app with node server.js) ======================================
app.listen(process.env.PORT || 8080);
console.log("App listening on port 8080");