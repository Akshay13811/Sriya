'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ValueSchema = new Schema({
	date: {
		type: Number,
		required: 'Please enter the date for this valuation'
	},
	value: {
		type: Number,
		required: 'Please enter the amount for this valuation'
	}
});

var AssetSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: 'Please enter the name of the asset'
	},
	description: {
		type: String
	},
	valuations: [ValueSchema],
	soldDate: {
		type: Number
	}

});

module.exports = mongoose.model('Asset', AssetSchema);
module.exports = mongoose.model('AssetValue', ValueSchema);
