'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
	date: Date,
	description: String,
	amount: Number
});

var AccountSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: 'Please enter the name of the Account'
	},
	current_balance: {
		type: Number,
		required: 'Please enter the balance for this account'
	},
	transactions: [TransactionSchema]
});

module.exports = mongoose.model('Accounts', AccountSchema);
module.exports = mongoose.model('Transactions', TransactionSchema);