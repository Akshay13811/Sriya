'use strict'

var mongoose = require('mongoose');
var accounts = require('../controllers/account-controller')
var shares = require('../controllers/share-controller')
var assets = require('../controllers/asset-controller')
var loans = require('../controllers/loan-controller')

const DAYINMS = 86400000;

exports.get_graph_data = async function(req, res) {
	console.log("*** Portfolio - Getting Graph Data *** ")
	var data = {};
	
	var accountsQuery = accounts.get_all_accounts_query();
	accountsQuery.exec((err, accountsData) => {
		console.log("*** Portfolio - Executed Accounts Query ***");
		if(err)
		   return console.log({error: err});

		var accountsGraphData = accounts.get_combined_graph_data(accountsData, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval));
		data.accounts = accountsGraphData;
		checkReadyToProcess(data, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
	});

	var sharesQuery = shares.get_all_shares_query();
	sharesQuery.exec(async (err, sharesData) => {
		console.log("*** Portfolio - Executed Shares Query ***");
		if(err)
		   return console.log({error: err});

		var sharesGraphData = await shares.get_combined_graph_data(sharesData, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval));
		console.log("*** Portfolio - Share Data Returned ***");
		data.shares = sharesGraphData;
		checkReadyToProcess(data, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
	});

	var loansQuery = loans.get_all_loans_query();
	loansQuery.exec((err, loansData) => {
		console.log("*** Portfolio - Executed Loans Query ***");
		if(err)
		   return console.log({error: err});

		var loansGraphData = loans.get_combined_graph_data(loansData, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval));
		data.loans = loansGraphData;
		checkReadyToProcess(data, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
	});

	var assetsQuery = assets.get_all_assets_query();
	assetsQuery.exec((err, assetsData) => {
		console.log("*** Portfolio - Executed Assets Query ***");
		if(err)
		   return console.log({error: err});

		var assetsGraphData = assets.get_combined_graph_data(assetsData, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval));
		data.assets = assetsGraphData;
		checkReadyToProcess(data, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
	});
}

function checkReadyToProcess(data, timePeriod, timeInterval, res) {
	if(data.accounts && data.shares && data.assets && data.loans) {
		console.log("*** Portfolio - Ready to process data ***")
		var graphData = combineAllData(data, timePeriod, timeInterval)
		res.json(graphData);
	}
	else {
		console.log("*** Portfolio - Not ready to process data ***")
	}
}

function combineAllData(data, timePeriod, timeInterval) {
	var interval = DAYINMS*timeInterval;

	var combinedData = {};
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);
	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	while(currentDate >= lastDate) {
		combinedData[currentDate.getTime()] = 0
		combinedData[currentDate.getTime()] += data.accounts[currentDate.getTime()]
		combinedData[currentDate.getTime()] += data.shares[currentDate.getTime()]
		combinedData[currentDate.getTime()] += data.assets[currentDate.getTime()]
		combinedData[currentDate.getTime()] -= data.loans[currentDate.getTime()]

		combinedData[currentDate.getTime()] = Math.round(combinedData[currentDate.getTime()]);

		var updatedDates = getNextDates(currentDate, lastDate, interval);
		currentDate = updatedDates.currentDate;
		lastDate = updatedDates.lastDate;	
	}

	return combinedData;
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