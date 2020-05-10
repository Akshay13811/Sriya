var express = require('express'),
	app = express(),
	port = process.argv[2] || process.env.PORT || 3002,
	mongoose = require('mongoose'),
	Account = require('./api/models/account-model'),
	Share = require('./api/models/share-model'),
	Loan = require('./api/models/loan-model'),
	Asset = require('./api/models/asset-model'),
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

var portfolioRoutes = require('./api/routes/portfolio-routes');
portfolioRoutes(app);

var accountRoutes = require('./api/routes/account-routes');
accountRoutes(app);

var loanRoutes = require('./api/routes/loan-routes');
loanRoutes(app);

var shareRoutes = require('./api/routes/share-routes');
shareRoutes(app);

var assetRoutes = require('./api/routes/asset-routes');
assetRoutes(app);

app.listen(port);

console.log('Sriya RESTful API server started on: ' + port)

