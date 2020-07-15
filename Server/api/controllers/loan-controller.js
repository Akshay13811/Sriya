'use strict'

var mongoose = require('mongoose');
var Loan = mongoose.model('Loan');
var Transaction = mongoose.model('LoanTransaction');
var CSV = require('csv-string');

const DAYINMS = 86400000;

exports.list_loans = function(req, res) {
	Loan.find({}, function(err, loan) {
		if(err)
			res.send(err);
		res.json(loan)
	});
}

exports.create_loan = function(req, res) {
	console.log("*** Loans - Creating new loan ***");
	if(!req.files || Object.keys(req.files).length === 0) {
		console.log('no files uploaded');
	}

	var currentBalance = 0;
	var transactions = [];
	if(req.files && Object.keys(req.files).length > 0) {
		if(req.body.bankName == "ING" || req.body.bankName.toLowerCase() == "parents") {
			var info = importINGFile(req.files.importFile);
			transactions = info.transactions;
			currentBalance = info.currentBalance;
		}
	}
	else if(req.body.currentBalance) {
		currentBalance = req.body.currentBalance;
	}

	var new_loan = new Loan(req.body);
	new_loan.transactions = transactions;
	new_loan.currentBalance = currentBalance;
	new_loan.save(function(err, loan) {
		if(err)
			res.send(err);
		res.json(loan);
	})
}

exports.get_loan_details = function(req, res) {
	Loan.findOne({
		_id: req.params.loanId
	}, function(err, loan) {
		//Go through transaction history for specified period
		let period = req.params.period;
		let lastDate = new Date().getTime() - period*DAYINMS;
		
		let payments = 0;
		let interest = 0;
		for(let transaction of loan.transactions) {
			if(transaction.date < lastDate) {
				break;
			}

			if(transaction.description.startsWith("Interest Charge")) {
				interest += transaction.amount;
			}
			else {
				payments -= transaction.amount;
			}
		}

		res.json({
			payments: payments,
			interest: interest
		})
	});
}

exports.delete_loan = function(req, res) {
	Loan.remove({
		_id: req.params.loanId
	}, function(err, loan) {
		if (err)
			res.send(err)
		res.json({ message: 'Loan successfully deleted' , success: true});
	})
}

exports.update_loan = function(req, res) {
	Loan.findOne({
		_id: req.params.loanId
	}, function(err, loan) {
		var currentBalance = loan.currentBalance;
		var transactions = [];
		var balance = 0;
		if(req.files && Object.keys(req.files).length > 0) {
			if(loan.bankName == "ING" || loan.bankName.toLowerCase() == "parents") {
				var info = importINGFile(req.files.importFile);
				transactions = info.transactions;
				balance = info.currentBalance;
			}
		}

		loan.loanAmount = req.body.loanAmount;
		loan.interestRate = req.body.interestRate;

		//Update loan with new transactions
		if(loan.transactions.length == 0) {
			//Import all transactions into the loan
			loan.transactions = transactions;
			loan.currentBalance = balance;
		}
		else {
			//Last transaction known by server for this loan
			let date = new Date(loan.transactions[0].date)
			let amount = loan.transactions[0].amount;
			let description = loan.transactions[0].description;

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

				var updatedTransactions = newTransactions.concat(loan.transactions);
				loan.transactions = updatedTransactions;
				loan.currentBalance = currentBalance;
			}
		}
		loan.save();	

		if (err)
			res.send(err);
		res.json({ loan: loan, success: true});

	});
  };

exports.graph_all_data = function(req, res) {
	processGraphData(parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
}

exports.get_total = function(req, res) {
	Loan.find({}, function(err, loans) {
		var total = 0;
		for(var i=0; i<loans.length; i++) {
			total += loans[i].currentBalance;
		}
		res.json({"total" : total})
	});
}

exports.get_all_loans_query = getAllLoansQuery
exports.get_combined_graph_data = getCombinedGraphData

function getAllLoansQuery() {
	 var query = Loan.find({});
	 return query;
}

function getCombinedGraphData(loans, period, interval) {
	var loansData = [];
	for(var i=0; i<loans.length; i++) {
		loansData.push(calculateGraphData(loans[i], period, interval));
	}

	var graphData = combineAllData(loansData, period, interval);
	return graphData;
}

function processGraphData(period, interval, res) {
	var graphData = {}; 

	if(interval > period) {
		res.send({error: "Requested interval cannot be larger than period"})
		return;
	}

	Loan.find({}).then(loans => {
			graphData = getCombinedGraphData(loans, period, interval);
			if(res) {
				res.send(graphData);
			}
		}
		, err => {
			throw new Error("An error occurred when accessing loan data")
		}
	);

	return;
}

function importINGFile(importFile) {
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
			currentBalance -= amount;
	
			var dateInfo = entry[0].split('/');
			date = new Date();
			date.setHours(0, 0, 0, 0);
			date.setFullYear(dateInfo[2]);
			date.setMonth(dateInfo[1]-1);
			date.setDate(dateInfo[0]);
	
			var transaction = {
				"date" : date.getTime(),
				"description" : entry[1],
				"amount" : -amount
			}	
			transactions.push(transaction);
		}
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

function calculateGraphData(loanData, timePeriod, timeInterval) {
	
	console.log("*** Loans - Getting Graph Data ***");

	var interval = DAYINMS*timeInterval;
	
	//Get current data
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	var currentBalance = loanData.currentBalance / 100;
	var data = {}
                                                                                                       
	for(var i=0; i<loanData.transactions.length; i++) {
		var transaction = loanData.transactions[i];
		var transactionDate = new Date(transaction.date);
		console.log(transactionDate);

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

		//Ensure that the last non-zero data point is the loan amount if loan amount is non zero
		//Loan amounts of zero are loans accurred over time with no initial loan amount
		if(loanData.loanAmount != 0) {
			if(currentBalance == 0 && data[currentDate.getTime() + interval] && data[currentDate.getTime() + interval] != loanData.loanAmount && data[currentDate.getTime() + interval] != 0) {
				data[currentDate.getTime() + interval] = loanData.loanAmount / 100;
			}
		}
	}

	//Fill out all remaining dates with the current balance
	while(currentDate >= lastDate) {
		data[currentDate.getTime()] = currentBalance;
		var updatedDates = getNextDates(currentDate, lastDate, interval);
		currentDate = updatedDates.currentDate;
		lastDate = updatedDates.lastDate;
	}

	console.log("*** Loans - Exit Getting Graph Data ***");
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