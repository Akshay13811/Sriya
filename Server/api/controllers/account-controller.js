'use strict'

var mongoose = require('mongoose');
var Account = mongoose.model('Account');
var Transaction = mongoose.model('AccountTransaction');
var CSV = require('csv-string');

const DAYINMS = 86400000;

/* --- Accounts --- */

exports.list_accounts = function(req, res) {
	Account.find({}, function(err, account) {
		if(err)
			res.send(err);
		res.json(account)
	});
}

exports.create_account = function(req, res) {
	if(!req.files || Object.keys(req.files).length === 0) {
		console.log('no files uploaded');
	}

	var currentBalance = 0;
	var transactions = [];
	if(req.files && Object.keys(req.files).length > 0) {
		var accountBalance = null;
		if(req.body.accountBalance) {
			accountBalance = parseInt(req.body.accountBalance * 100);
		}

		if(req.body.bankName == "ING") {
			var info = importINGFile(req.files.importFile, accountBalance);
			transactions = info.transactions;
			currentBalance = info.currentBalance;
		}
		else if(req.body.bankName == "UBANK") {
			var info = importUBankFile(req.files.importFile, accountBalance);
			transactions = info.transactions;
			currentBalance = info.currentBalance;
		}
		else if(req.body.bankName == "RAMS") {
			var info = importRamsFile(req.files.importFile, accountBalance);
			transactions = info.transactions;
			currentBalance = info.currentBalance;			
		}
		else if(req.body.bankName == "COMMBANK") {
			var info = importCommBankFile(req.files.importFile, accountBalance);
			transactions = info.transactions;
			currentBalance = info.currentBalance;			
		}
	}
	else if(req.body.currentBalance) {
		currentBalance = req.body.currentBalance;
	}

	var new_account = new Account(req.body);
	new_account.transactions = transactions;
	new_account.currentBalance = currentBalance;
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
		res.json({ message: 'Account successfully deleted' , success: true});
	})
}

exports.update_account = function(req, res) {
	Account.findOne({
		_id: req.params.accountId
	}, function(err, account) {
		var currentBalance = account.currentBalance;
		var transactions = [];
		var balance = 0;
		if(req.files && Object.keys(req.files).length > 0) {
			if(account.bankName == "ING") {
				var info = importINGFile(req.files.importFile);
				transactions = info.transactions;
				balance = info.currentBalance;
			}
			else if(account.bankName == "UBANK") {
				var info = importUBankFile(req.files.importFile);
				transactions = info.transactions;
				balance = info.currentBalance;
			}
			else if(account.bankName == "RAMS") {
				var info = importRamsFile(req.files.importFile);
				transactions = info.transactions;
				balance = info.currentBalance;			
			}
			else if(account.bankName == "COMMBANK") {
				var info = importCommBankFile(req.files.importFile);
				transactions = info.transactions;
				balance = info.currentBalance;			
			}
		}

		//Update account with new transactions
		if(account.transactions.length == 0) {
			//Import all transactions into the account
			account.transactions = transactions;
			account.currentBalance = balance;
		}
		else {
			//Last transaction known by server for this account
			let date = new Date(account.transactions[0].date)
			let amount = account.transactions[0].amount;
			let description = account.transactions[0].description;

			//Find the last common transaction between the lists
			var matchingTransactionIndex = 0;
			for(var i=0; i<transactions.length; i++)
			{
				if(transactions[i].date == date.getTime() && transactions[i].amount == amount && transactions[i].description == description) {
					console.log("Found last common transaction: " + i);
					matchingTransactionIndex = i;
					break;
				}
			}

			if(matchingTransactionIndex != 0) {
				//Prepend all transactions up to the last common transaction
				var newTransactions = transactions.splice(0, matchingTransactionIndex);

				for(var i=0; i<newTransactions.length; i++) {
					currentBalance += newTransactions[i].amount
				}

				var updatedTransactions = newTransactions.concat(account.transactions);
				account.transactions = updatedTransactions;
				account.currentBalance = currentBalance;
			}
		}
		account.save();	

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
	processGraphData(parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
}

exports.get_total = function(req, res) {
	Account.find({}, function(err, accounts) {
		var total = 0;
		for(var i=0; i<accounts.length; i++) {
			total += accounts[i].currentBalance;
		}
		res.json({"total" : total})
	});
}

exports.get_all_accounts_query = getAllAccountsQuery
exports.get_combined_graph_data = getCombinedGraphData

function getAllAccountsQuery() {
	var query = Account.find({});
	return query;
}

function getCombinedGraphData(accounts, period, interval) {
	var accountsData = [];
	for(var i=0; i<accounts.length; i++) {
		accountsData.push(calculateGraphData(accounts[i].currentBalance, accounts[i].transactions, period, interval));
	}

	var graphData = combineAllData(accountsData, period, interval);
	return graphData;
}

function processGraphData(period, interval, res) {
	var graphData = {}; 

	if(interval > period) {
		res.send({error: "Requested interval cannot be larger than period"})
		return;
	}

	Account.find({}).then(accounts => {
			graphData = getCombinedGraphData(accounts, period, interval);
			console.log(graphData);
			if(res) {
				res.send(graphData);
			}
		}
		, err => {
			throw new Error("An error occurred when accessing account data")
		}
	);

	return;
}

function importCommBankFile(importFile, accountBalance) {
	var csvData = importFile.data.toString('utf8');
	var transactions = [];
	var currentBalance = 0;

	var pattern = /[^0-9.-]+/g;

	var entries = CSV.parse(csvData);

	for(var i=0; i<entries.length; i++) {
		var entry = entries[i];

		var dateInfo = entry[0].split('/');
		var date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setFullYear(dateInfo[2]);
		date.setMonth(dateInfo[1]-1);
		date.setDate(dateInfo[0]);
	
		var amount = 0;
		if(entry[1] != '') {
			amount = Math.round(parseFloat(entry[1].replace(pattern, ''))*100);
			currentBalance += amount;
		}
	
		var transaction = {
			"date" : date.getTime(),
			"description" : entry[2],
			"amount" : amount
		}

		transactions.push(transaction);
	}

	if(accountBalance != null && currentBalance != accountBalance) {
		var transaction = {
			"date" : date.getTime(),
			"description" : "Initial ammount",
			"amount" : accountBalance - currentBalance
		}

		transactions.push(transaction);
		currentBalance += transaction.amount;
	}
	
	return {
		"transactions" : transactions,
		"currentBalance" : currentBalance
	}
}

function importRamsFile(importFile, accountBalance) {
	var csvData = importFile.data.toString('utf8');
	var transactions = [];
	var currentBalance = 0;

	var startingLine = 1;
	var pattern = /[^0-9.-]+/g;

	var entries = CSV.parse(csvData);

	for(var i=startingLine; i<entries.length; i++) {
		var entry = entries[i];

		var dateInfo = entry[0].split('/');
		var date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setFullYear(dateInfo[2].substring(0,4));
		date.setMonth(dateInfo[1]-1);
		date.setDate(dateInfo[0]);
	
		var amount = 0;
		if(entry[2] != '') {
			amount = Math.round(parseFloat(entry[2].replace(pattern, ''))*100);
			currentBalance += amount;
		}
	
		var transaction = {
			"date" : date.getTime(),
			"description" : entry[1],
			"amount" : amount
		}

		transactions.push(transaction);
	}

	if(accountBalance != null && currentBalance != accountBalance) {
		var transaction = {
			"date" : date.getTime(),
			"description" : "Initial ammount",
			"amount" : accountBalance - currentBalance
		}

		transactions.push(transaction);
		currentBalance += transaction.amount;
	}
	
	return {
		"transactions" : transactions,
		"currentBalance" : currentBalance
	}
}

function importUBankFile(importFile, accountBalance) {
	var csvData = importFile.data.toString('utf8');
	var lines = csvData.split('\n');
	var transactions = [];
	var currentBalance = 0;

	var startingLine = 0;
	while(!lines[startingLine].startsWith(",Transaction date") && startingLine < lines.length) {
		startingLine++;
	}

	var datePos, amountPos, descPos;
	//Determine positioning of information in the csv
	var line = CSV.parse(lines[startingLine]);
	for(var i=0; i<line[0].length; i++) {
		if(line[0][i] == "Transaction date") {
			datePos = i;
		}
		else if(line[0][i] == "Amount") {
			amountPos = i;
		}
		else if(line[0][i] == "Description") {
			descPos = i;
		}
	}

	var pattern = /[^0-9.-]+/g;
	for(var i=startingLine+1; i<lines.length; i++) {
		if(lines[i] != '') {
			var entry = CSV.parse(lines[i]);

			var dateInfo = entry[0][datePos].split('/');
			var date = new Date();
			date.setHours(0, 0, 0, 0);
			date.setFullYear(dateInfo[2]);
			date.setMonth(dateInfo[1]-1);
			date.setDate(dateInfo[0]);
		
			var amount = 0;
			if(entry[0][amountPos] != '') {
				amount = Math.round(parseFloat(entry[0][amountPos].replace(pattern, ''))*100);
				currentBalance += amount;
			}
		
			var transaction = {
				"date" : date.getTime(),
				"description" : entry[0][descPos],
				"amount" : amount
			}

			transactions.push(transaction);
		}
		else {
			//End of transaction list
			break;
		}
	}

	if(accountBalance != null && currentBalance != accountBalance) {
		var transaction = {
			"date" : date.getTime(),
			"description" : "Initial ammount",
			"amount" : accountBalance - currentBalance
		}

		transactions.push(transaction);
		currentBalance += transaction.amount;
	}

	return {
		"transactions" : transactions,
		"currentBalance" : currentBalance
	}
}

function importINGFile(importFile, accountBalance) {
	var csvData = importFile.data.toString('utf8');
	var entries = csvData.split('\n');
	var transactions = [];
	var currentBalance = 0;

	var date;
	for(var i=1; i<entries.length; i++) { //Ignore first line as it is the heading
		if(entries[i] != '') {
			var entry = entries[i].split(',');

			var amount = 0;
			if(entry[entry.length-3] != "") {
				amount = Math.round(parseFloat(entry[entry.length-3])*100);
			}
			else {
				amount = Math.round(parseFloat(entry[entry.length-2])*100);
			}
			currentBalance += amount;
	
			var dateInfo = entry[0].split('/');
			date = new Date();
			date.setHours(0, 0, 0, 0);
			date.setFullYear(dateInfo[2]);
			date.setMonth(dateInfo[1]-1);
			date.setDate(dateInfo[0]);
	
			var transaction = {
				"date" : date.getTime(),
				"description" : entry[1],
				"amount" : amount
			}	
			transactions.push(transaction);
		}
	}

	if(accountBalance != null && currentBalance != accountBalance) {
		var transaction = {
			"date" : date.getTime(),
			"description" : "Initial ammount",
			"amount" : currentBalance - accountBalance
		}
		
		transactions.push(transaction);
		currentBalance += transaction.amount;
	}

	return {
		"transactions" : transactions,
		"currentBalance" : currentBalance
	}
}

function combineAllData(data, timePeriod, timeInterval) {
	if(data.length == 0) {
		return {};
	}
	else if(data.length == 1) {
		return data[0];
	}

	var interval = DAYINMS*timeInterval;

	var combinedData = {};
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);
	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	while(currentDate >= lastDate) {
		combinedData[currentDate.getTime()] = Math.round(data[0][currentDate.getTime()])
		for(var i=1; i<data.length; i++) {
			if(data[i][currentDate.getTime()]) {
				if(!combinedData[currentDate.getTime()]) {
					combinedData[currentDate.getTime()] = Math.round(data[i][currentDate.getTime()])
				}
				else {
					combinedData[currentDate.getTime()] += Math.round(data[i][currentDate.getTime()])
				}
			}
		}
		var updatedDates = getNextDates(currentDate, lastDate, interval);
		currentDate = updatedDates.currentDate;
		lastDate = updatedDates.lastDate;
	}

	return combinedData;
}

function calculateGraphData(balance, transactions, timePeriod, timeInterval) {
	
	var interval = DAYINMS*timeInterval;
	
	//Get current data
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	var currentBalance = balance / 100;
	var data = {}
                                                                                                       
	for(var i=0; i<transactions.length; i++) {
		var transaction = transactions[i];
		var transactionDate = new Date(transaction.date);

		if(transactionDate.getTime() <= lastDate) {
			break;
		}

		while(transactionDate.getTime() <= currentDate.getTime()) {
			data[currentDate.getTime()] = currentBalance;
			var updatedDates = getNextDates(currentDate, lastDate, interval);
			currentDate = updatedDates.currentDate;
			lastDate = updatedDates.lastDate;
		}
	
		currentBalance -= transaction.amount / 100;
		data[currentDate.getTime()] = currentBalance;
	}

	//Fill out all remaining dates with the current balance
	while(currentDate >= lastDate) {
		data[currentDate.getTime()] = currentBalance;
		var updatedDates = getNextDates(currentDate, lastDate, interval);
		currentDate = updatedDates.currentDate;
		lastDate = updatedDates.lastDate;
	}

	return data;
}

function getNextDates(currentDate, lastDate, interval) {
	var oldTimeOffset = currentDate.getTimezoneOffset();
	currentDate = new Date(currentDate - interval); 
	var newTimeOffset = currentDate.getTimezoneOffset();

	if(oldTimeOffset != newTimeOffset) { //Compenstate for DST
		currentDate = new Date(currentDate.getTime() + ((newTimeOffset - oldTimeOffset) * 60 * 1000));
		lastDate = lastDate + ((newTimeOffset - oldTimeOffset) * 60 * 1000);
	}

	return {
		"currentDate" : currentDate, 
		"lastDate": lastDate
	}
}