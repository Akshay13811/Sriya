'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ValueSchema = new Schema({
	date: Number,
	value: Number
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
	purchaseDate: {
		type: Number,
		required: 'Please enter the date when this asset was purchased/acquired'
	},
	soldDate: {
		type: Number
	}

});

module.exports = mongoose.model('Asset', AssetSchema);
module.exports = mongoose.model('AssetValue', ValueSchema);
