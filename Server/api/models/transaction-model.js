'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
	date: Number,
	description: String,
	amount: Number
});

module.exports = mongoose.model('Transaction', TransactionSchema);