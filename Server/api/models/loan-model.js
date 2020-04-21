'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
	date: Number,
	description: String,
	amount: Number
});

var LoanSchema = new Schema({
	bankName: {
		type: String,
		required: 'Please enter the name of the Bank'
	},
	accountName: {
		type: String,
		unique: true,
		required: 'Please enter the name of the Account'
	},
	loanAmount: {
		type: Number,
		required: 'Please enter the loan amount'
	},
	currentBalance: {
		type: Number,
	},
	transactions: [TransactionSchema]
});

module.exports = mongoose.model('Loan', LoanSchema);
module.exports = mongoose.model('LoanTransaction', TransactionSchema);
