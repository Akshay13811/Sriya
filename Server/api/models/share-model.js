'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShareSchema = new Schema ({
	index: {
		type: String,
	},
	code: {
		type: String,
	},
	purchasePrice: {
		type: Number
	},
	numberOfShares: {
		type: Number
	},
	purchaseDate: {
		type: Number
	},
	soldDate: {
		type: Number
	}
});

var ShareDailySchema = new Schema({
	date: Number,
	open: Number,
	close: Number,
	high: Number,
	low: Number
});

var ShareHistorySchema = new Schema ({
	index: {
		type: String
	},
	code: {
		type: String
	},
	lastUpdateDate: {
		type: Number
	},
	history: [ShareDailySchema]
});

module.exports = mongoose.model('Share', ShareSchema);
module.exports = mongoose.model('ShareHistory', ShareHistorySchema);
module.exports = mongoose.model('ShareDaily', ShareDailySchema);