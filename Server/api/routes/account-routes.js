'use strict';
module.exports = function(app) {
	var accounts = require('../controllers/account-controller')

	//Account Routes
	app.route('/accounts')
		.get(accounts.list_accounts)
		.post(accounts.create_account);

	app.route('/accounts/:accountId')
		.delete(accounts.delete_account)
		.post(accounts.update_account);

	app.route('/accounts/:accountId/transactions')
		.get(accounts.list_transactions)
		.post(accounts.create_transaction);

	app.route('/accounts/:accountId/transactions/:transactionId')
		.delete(accounts.delete_transaction)
		.post(accounts.update_transaction);

	app.route('/accounts/graph/:graphPeriod/:graphInterval')
		.get(accounts.graph_all_data)
}