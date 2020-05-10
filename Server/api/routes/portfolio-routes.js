'use strict';
module.exports = function(app) {
	var portfolio = require('../controllers/portfolio-controller')

	//Loan Routes
	app.route('/portfolio/graph/:graphPeriod/:graphInterval')
		.get(portfolio.get_graph_data)
}