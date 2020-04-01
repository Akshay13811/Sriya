'use strict'

var mongoose = require('mongoose');
var Account = mongoose.model('Accounts');
var Transaction = mongoose.model('Transactions');
var fs = require('fs');
var csv = require('csv-parser');

const DAYINMS = 86400000;

exports.list_accounts = function(req, res) {
	Account.find({}, function(err, account) {
		if(err)
			res.send(err);
		res.json(account)
	});
}

function importINGBankFile(importFile) {
	var csvData = importFile.data.toString('utf8');
	var entries = csvData.split('\n');
	var transactions = [];
	var currentBalance = 0;
	
	for(var i=1; i<entries.length; i++) { //Ignore first line as it is the heading
		if(entries[i] != '') {
			var entry = entries[i].split(',');

			var amount = 0;
			if(entry[entry.length-2] != "") {
				amount = parseFloat(entry[entry.length-2])
			}
			else {
				amount = parseFloat(entry[entry.length-1])
			}
			currentBalance += amount;
	
			var date = new Date();
			var dateInfo = entry[0].split('/');
			date.setDate(dateInfo[0]);
			date.setMonth(dateInfo[1]-1);
			date.setFullYear(dateInfo[2]);
			date.setHours(0, 0, 0, 0);
	
			var transaction = {
				"date" : date.getTime(),
				"description" : entry[2],
				"amount" : amount
			}
			transactions.push(transaction);
		}
	}

	console.log(currentBalance);

	return {
		"transactions" : transactions,
		"current_balance" : currentBalance
	}
}

exports.create_account = function(req, res) {
	if(!req.files || Object.keys(req.files).length === 0) {
		console.log('no files uploaded');
	}

	var currentBalance = 0;
	var transactions = [];
	if(req.files && Object.keys(req.files).length > 0) {
		if(req.body.name == "ING") {
			var info = importINGBankFile(req.files.importFile);
			console.log(info);
			transactions = info.transactions;
			currentBalance = info.current_balance;
		}
	}
	else if(req.body.current_balance) {
		currentBalance = req.body.current_balance;
	}

	var new_account = new Account(req.body);
	new_account.transactions = transactions;
	new_account.current_balance = currentBalance;
	new_account.save(function(err, account) {
		if(err)
			res.send(err);
		res.json(account);
	})
	
}

exports.delete_account = function(req, res) {
	Account.remove({
		_id: req.params.accountId
	}, function(err, account) {
		if (err)
			res.send(err)
		res.json({ message: 'Account successfully deleted' });
	})
}

exports.update_account = function(req, res) {
	Account.findOneAndUpdate({_id: req.params.accountId}, req.body, {new: true}, function(err, account) {
	  if (err)
		res.send(err);
	  res.json(account);
	});
  };

exports.list_transactions = function(req, res) {
	Account.findOne({
		_id: req.params.accountId
	}, function(err, account) {
		if(err)
			res.send(err);
		else if(!account)
			res.send({message: 'Specified account not found'})
		else
			res.json(account.transactions)
	});
}

exports.create_transaction = function(req, res) {
	Account.findOne({
		_id: req.params.accountId
	}, function(err, account) {
		if(err)
			res.send(err);
		else if(!account)
			res.send({message: 'Specified account not found'})
		else {
			var new_transaction = new Transaction(req.body);
			account.transactions.push(new_transaction)
			account.save();
			res.json(account.transactions)
		}
	});
}

exports.delete_transaction = function(req, res) {
	Account.update({
		_id: req.params.accountId
	}, {
		$pull: {
			transactions: {
				_id: req.params.transactionId
			}
		}
	},function(err, account) {
		if (err)
			res.send(err)
		res.json({ message: 'Transaction successfully deleted' });
	})
}

exports.update_transaction = function(req, res) {
	var update = req.body;
	update._id = req.params.transactionId
	Account.findOneAndUpdate({
		_id: req.params.accountId,
		"transactions._id": req.params.transactionId
	}, {
		$set: {
			"transactions.$": update
		}
	}, {
		new: true
	}, function(err, account) {
		if (err)
			res.send(err)
		res.json(account);
	})	
}

exports.graph_all_data = function(req, res) {
	Account.find({}, function(err, account) {
		if(err)
			res.send(err);

		if(parseInt(req.params.graphInterval) > parseInt(req.params.graphPeriod)) {
			res.send("Requested interval cannot be larger than period")
		}
		else {
			var data = {};
			for(var i=0; i<account.length; i++) {
				data = calculateGraphData(account[i],parseInt(req.params.graphPeriod),parseInt(req.params.graphInterval));
			}
		}

		res.json(data)
	});
}

function calculateGraphData(account, timePeriod, timeInterval) {

	var interval = DAYINMS*timeInterval;
	//Get current data
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	var endDate = currentDate.getTime() - DAYINMS*timePeriod;

	var currentBalance = account.current_balance;
	var data = {}

	//Set current balance for current date
	data[currentDate.getTime()] = currentBalance;

	//Change current date to the next date
	var nextDate = currentDate.getTime() - interval;
	currentDate = new Date(nextDate);
	nextDate = new Date(nextDate - interval);
	data[currentDate.getTime()] = currentBalance;
	                                                                                                                                    
	for(var i=0; i<account.transactions.length; i++) {
		var transaction = account.transactions[i];
		var transactionDate = new Date(transaction.date);

		if(transactionDate <= endDate) {
			break;
		}

		while(transactionDate <= currentDate) {
			currentDate = new Date(currentDate - interval);
			data[currentDate.getTime()] = currentBalance;
		}
	
		data[currentDate.getTime()] -= transaction.amount;
		currentBalance -= transaction.amount;
	}

	return data;
}