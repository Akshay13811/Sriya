var express = require('express'),
	app = express(),
	port = process.env.PORT || 3002,
	mongoose = require('mongoose'),
	Account = require('./api/models/account-model'),
	bodyParser = require('body-parser');

var cors = require('cors');

//mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Accounts', { useNewUrlParser: true});

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/account-routes');
routes(app);

app.listen(port);

console.log('Sriya RESTful API server started on: ' + port)

