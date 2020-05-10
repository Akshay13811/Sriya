'use strict';
module.exports = function(app) {
	var assets = require('../controllers/asset-controller')

	//Asset Routes
	app.route('/assets')
		.get(assets.list_assets)
		.post(assets.create_asset);

	app.route('/assets/:assetId')
		.delete(assets.delete_asset)
		.post(assets.update_asset);

	app.route('/assets/:assetId/valuations')
		.get(assets.list_valuations)
		.post(assets.create_valuation);

	app.route('/assets/:assetId/valuations/:valuationId')
		.delete(assets.delete_valuation)
		.post(assets.update_valuation);

	app.route('/assets/graph/:graphPeriod/:graphInterval')
		.get(assets.graph_all_data)

	app.route('/assets/total')
		.get(assets.get_total)
}