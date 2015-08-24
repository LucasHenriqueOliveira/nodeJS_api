var express = require('express'),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;

// IMPORT MODELS
// =============================================================================
var Sequelize = require('sequelize');

// db config
var env = "dev";
var config = require('./database.json')[env];
var password = config.password ? config.password : null;

// initialize database connection
var sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
        logging: console.log,
        define: {
            timestamps: false
        }
    }
);

var crypto = require('crypto');
var DataTypes = require("sequelize");

var User = sequelize.define('users', {
    username: DataTypes.STRING,
    password: DataTypes.STRING
}, {
    instanceMethods: {
        retrieveAll: function(onSuccess, onError) {
            User.findAll({}, {raw: true})
                .success(onSuccess).error(onError);
        },
        retrieveById: function(user_id, onSuccess, onError) {
            User.find({where: {id: user_id}}, {raw: true})
                .success(onSuccess).error(onError);
        },
        add: function(onSuccess, onError) {
            var username = this.username;
            var password = this.password;

            var shasum = crypto.createHash('sha1');
            shasum.update(password);
            password = shasum.digest('hex');

            User.build({ username: username, password: password })
                .save().success(onSuccess).error(onError);
        },
        updateById: function(user_id, onSuccess, onError) {
            var id = user_id;
            var username = this.username;
            var password = this.password;

            var shasum = crypto.createHash('sha1');
            shasum.update(password);
            password = shasum.digest('hex');

            User.update({ username: username,password: password},{where: {id: id} })
                .success(onSuccess).error(onError);
        },
        removeById: function(user_id, onSuccess, onError) {
            User.destroy({where: {id: user_id}}).success(onSuccess).error(onError);
        }
    }
});

// IMPORT ROUTES
// =============================================================================
var router = express.Router();

// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

// create a user (accessed at POST http://localhost:8080/api/users)
.post(function(req, res) {

    var username = req.body.username; //bodyParser does the magic
    var password = req.body.password;

    var user = User.build({ username: username, password: password });

    user.add(function(success){
            res.json({ message: 'User created!' });
        },
        function(err) {
            res.send(err);
        });
});
