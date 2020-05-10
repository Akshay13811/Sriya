'use strict';
module.exports = function(app) {
	var shares = require('../controllers/share-controller')

	//Share Routes
	app.route('/shares')
		.get(shares.list_shares)
		.post(shares.create_share)

	app.route('/shares/:shareId')
		.post(shares.update_share)
		.delete(shares.delete_share)

	app.route('/sharescombined')
		.get(shares.list_combined_shares)

	app.route('/dailyshare/:index/:code')
		.get(shares.get_daily_share_data)

	app.route('/shares/updatesharehistory')
		.get(shares.update_history)

	app.route('/shares/graph/:graphPeriod/:graphInterval')
		.get(shares.graph_all_data)

	app.route('/shares/total')
		.get(shares.get_total)
}