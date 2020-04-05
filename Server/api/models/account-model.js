'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
	date: Number,
	description: String,
	amount: Number
});

var AccountSchema = new Schema({
	bankName: {
		type: String,
		required: 'Please enter the name of the Bank'
	},
	accountName: {
		type: String,
		unique: true,
		required: 'Please enter the name of the Account'
	},
	currentBalance: {
		type: Number,
	},
	transactions: [TransactionSchema]
});

module.exports = mongoose.model('Accounts', AccountSchema);
module.exports = mongoose.model('Transactions', TransactionSchema);