'use strict';
module.exports = function(app) {
	var loans = require('../controllers/loan-controller')

	//Loan Routes
	app.route('/loans')
		.get(loans.list_loans)
		.post(loans.create_loan);

	app.route('/loans/details/:loanId/:period')
		.get(loans.get_loan_details)

	app.route('/loans/:loanId')
		.delete(loans.delete_loan)
		.post(loans.update_loan);

	app.route('/loans/graph/:graphPeriod/:graphInterval')
		.get(loans.graph_all_data)

	app.route('/loans/total')
		.get(loans.get_total)
}