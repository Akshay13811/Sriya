var express = require('express'),
	app = express(),
	port = process.env.PORT || 3002,
	mongoose = require('mongoose'),
	Account = require('./api/models/account-model'),
	Share = require('./api/models/share-model'),
	bodyParser = require('body-parser'),
	fileUpload = require('express-fileupload');


var cors = require('cors');

//mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Accounts', { useNewUrlParser: true});

app.use(cors())
app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var accountRoutes = require('./api/routes/account-routes');
accountRoutes(app);

var shareRoutes = require('./api/routes/share-routes');
shareRoutes(app);

app.listen(port);

console.log('Sriya RESTful API server started on: ' + port)

