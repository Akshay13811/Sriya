'use strict'

var mongoose = require('mongoose');
var Share = mongoose.model('Share')
var ShareHistory = mongoose.model('ShareHistory')

const fetch = require("node-fetch");

const AlphaAdvantageUrl = 'https://www.alphavantage.co/query?';
const AlphaAdvantageAPIKey = 'MEFRXCIZH7KIKI26';

const RapidApiKey = '7ebe78ee49msh055d582bb72c610p1db410jsnd866d6904ae0';

const DAYINMS = 86400000;

/* --- Shares --- */
var updateHistoryInProgress = false;
var updateHistoryCounter = 0;
var updateHistorySize = 0;
var updateHistoryRes = null;

exports.list_shares = function(req, res) {
	console.log("*** Shares -  Listing Shares ***");
	Share.find({}, function(err, shares) {
		if(err)
			res.send(err);
		res.json(shares)
	});
}

exports.list_combined_shares = function(req, res) {
	console.log("*** Shares - Listing Shares - Combined ***");
	Share.find({}, function(err, shares) {
		var shareList = {};
		for(var i=0; i<shares.length; i++) {
			if(shares[i].soldDate !== undefined) { //skip sold shares
				continue;
			}
			var shareIndexCode = shares[i].index + "." + shares[i].code;
			if(!shareList[shareIndexCode]) {
				shareList[shareIndexCode] = shares[i];
			}
			else {
				var totalShares = shareList[shareIndexCode].numberOfShares + shares[i].numberOfShares;
				var totalValue = shareList[shareIndexCode].numberOfShares * shareList[shareIndexCode].purchasePrice + shares[i].numberOfShares * shares[i].purchasePrice;
				var pricePerShare = totalValue / totalShares;
				shareList[shareIndexCode].purchasePrice = pricePerShare;
				shareList[shareIndexCode].numberOfShares = totalShares;
			}
		}

		if(err)
			res.send(err);
		res.json(Object.values(shareList));
	});
}

exports.create_share = function(req, res) {
	console.log("*** Shares - Creating Share Entry - Index: " + req.body.index + ", Code: " + req.body.code);
	var newShare = new Share(req.body);
	newShare.index = newShare.index.toUpperCase();
	newShare.code = newShare.code.toUpperCase();
	
	newShare.save(function(err, share) {
		if(err)
			res.send(err);
		res.json(share);
	});

	importShareHistory_YahooFin(req.body.index, req.body.code, res);
}

exports.delete_share = function(req, res) {
	("*** Deleting share ***")
	Share.deleteOne({
		_id: req.params.shareId
	}, function(err, share) {
		if (err)
			res.send(err)
		res.json({ message: 'Share successfully deleted' , success: true});
	})
}

exports.update_share = function(req, res) {
	console.log("*** Shares - Updating share ***")
	Share.findOne({
		_id: req.params.shareId
	}, function(err, share) {
		share.index = req.body.index;
		share.code = req.body.code;
		share.purchaseDate = req.body.purchaseDate;
		share.soldDate = req.body.soldDate;
		share.numberOfShares = req.body.numberOfShares;
		share.purchasePrice = req.body.purchasePrice;

		share.save();

		if (err)
			res.send(err)
		res.json({ message: 'Share successfully updated' , success: true});
	})
}

exports.get_daily_share_data = async function(req, res) {
	console.log("*** Getting Daily Share Data for Index: " + req.params.index + ", Code: " + req.params.code + " ***")
	
	const shareHistory = await ShareHistory.aggregate([{ 
		"$match" : {
			index: req.params.index.toUpperCase(),
			code: req.params.code.toUpperCase()
		},
		}, 
		{
			"$project" : {
				"current" : { $arrayElemAt: ["$history", 0] },
				"last" : { $arrayElemAt: ["$history", 1] }
			}
		}
	])

	if(!shareHistory) {
		res.send("Share entry invalid");
		return;
	}

	if(shareHistory.length > 0 && (!shareHistory[0].current || !shareHistory[0].current)) {
		res.send("Could not retrieve history");
		return;
	}

	res.send({
		currentSharePrice: shareHistory[0].current.close,
		lastCloseSharePrice: shareHistory[0].last.close
	})
}

exports.update_history = function(req, res) {
	console.log("*** Shares - Updating History *** ")

	if(updateHistoryInProgress) {
		res.send({status: 1});
		return;
	}

	//Initialise global variables to prevent additional update history calls whilst updating
	updateHistoryInProgress = true;
	updateHistoryCounter = 0;
	updateHistoryRes = {};
	updateHistoryRes.status = 0;
	updateHistoryRes.timestamp = new Date().getTime();
	updateHistoryRes.updates = [];

	ShareHistory.find({}, function(err, shares) {
		updateHistorySize = shares.length;

		for(var i=0; i<shares.length; i++) {
			setTimeout(importShareHistory_YahooFin, i*500, shares[i].index, shares[i].code, res);
		}
	});
}

exports.graph_all_data = async function(req, res) {
	console.log("*** Shares - Getting Graph Data *** ")
	processGraphData(parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
}

exports.get_total = function(req, res) {
	Share.find({}, async function(err, shares) {
		var total = 0;
		for(var i=0; i<shares.length; i++) {
			if(!shares[i].soldDate) {

				const shareHistory = await ShareHistory.aggregate([{ 
						"$match" : {
							"index" : shares[i].index,
							"code" : shares[i].code,
						},
					}, 
					{
						"$project" : {
							"first" : { $arrayElemAt: ["$history", 0] }
						}
					}
				])

				if(shareHistory.length > 0 && shareHistory[0].first) {
					total += parseInt(shareHistory[0].first.close * shares[i].numberOfShares * 100);
				}
			}
		}
		res.json({"total" : total})
	});
}

exports.get_all_shares_query = getAllSharesQuery
exports.get_combined_graph_data = getCombinedGraphData

function getAllSharesQuery() {
	var query = Share.find({});
	return query;
}

function processGraphData(period, interval, res) {
	var graphData = {}; 

	if(interval > period) {
		res.send({error: "Requested interval cannot be larger than period"})
		return;
	}

	Share.find({}).then(async (shares) => {
			graphData = await getCombinedGraphData(shares, period, interval);
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

async function getCombinedGraphData(shares, period, interval) {

	var promise = () => (
		new Promise(async (resolve, reject) => {
			var sharesData = [];
			for(var i=0; i<shares.length; i++) {
				sharesData.push(await calculateGraphData(shares[i], period, interval));
			}

			var graphData = combineAllData(sharesData, period, interval);
			resolve(graphData);
		})
	)
	var graphData = await (promise());
	return graphData;
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

async function calculateGraphData(share, timePeriod, timeInterval) {

	var interval = DAYINMS*timeInterval;

	//Get current data
	var currentDate = new Date();
	currentDate.setHours(0,0,0,0);

	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	var data = {};
	while(currentDate.getTime() >= lastDate) {
		//Check if share holding was held at this date
		if(currentDate.getTime() < share.purchaseDate) {
			data[currentDate.getTime()] = 0;
			var updatedDates = getNextDates(currentDate, lastDate, interval);
			currentDate = updatedDates.currentDate;
			lastDate = updatedDates.lastDate;
			continue;			
		}

		//Check if share was sold prior to this date
		if(share.soldDate && currentDate.getTime() > share.soldDate) {
			data[currentDate.getTime()] = 0;
			var updatedDates = getNextDates(currentDate, lastDate, interval);
			currentDate = updatedDates.currentDate;
			lastDate = updatedDates.lastDate;
			continue;
		}
		
		const shareHistory = await ShareHistory.aggregate([
			{ 
				"$unwind" : "$history" 
			},
			{ 
				"$match" : {
					"index" : share.index,
					"code" : share.code,
					"history.date" : currentDate.getTime()
				}	 
			}
		])

		if(!shareHistory[0]) {
			//Search for last trading day to get close price
			var lastTradingDate = new Date(currentDate.getTime() - DAYINMS);
			var lastTradingDayFound = false;
			while(!lastTradingDayFound) {
				const shareHistory = await ShareHistory.aggregate([
					{ 
						"$unwind" : "$history" 
					},
					{ 
						"$match" : {
							"index" : share.index,
							"code" : share.code,
							"history.date" : lastTradingDate.getTime()
						}	 
					}
				])
				if(shareHistory[0]) {
					data[currentDate.getTime()] = parseFloat(share.numberOfShares) * parseFloat(shareHistory[0].history.close);
					lastTradingDayFound = true;
				}

				lastTradingDate = getNextDate(lastTradingDate, DAYINMS);
			}
		}
		else if(shareHistory[0]) {
			data[currentDate.getTime()] = parseFloat(share.numberOfShares) * parseFloat(shareHistory[0].history.close);
		}

		var updatedDates = getNextDates(currentDate, lastDate, interval);
		currentDate = updatedDates.currentDate;
		lastDate = updatedDates.lastDate;
	}

	return data;
}

function getNextDate(date, interval) {
	var oldTimeOffset = date.getTimezoneOffset();
	date = new Date(date - interval); 
	var newTimeOffset = date.getTimezoneOffset();

	if(oldTimeOffset != newTimeOffset) { //Compenstate for DST
		date = new Date(date.getTime() + ((newTimeOffset - oldTimeOffset) * 60 * 1000));
	}

	return date;
}

function getNextDates(currentDate, lastDate, interval) {
	var oldTimeOffset = currentDate.getTimezoneOffset();
	currentDate = new Date(currentDate - interval); 
	var newTimeOffset = currentDate.getTimezoneOffset();

	if(oldTimeOffset !== newTimeOffset) { //Compenstate for DST
		currentDate = new Date(currentDate.getTime() + ((newTimeOffset - oldTimeOffset) * 60 * 1000));
		lastDate = lastDate + ((newTimeOffset - oldTimeOffset) * 60 * 1000);
	}

	return {
		"currentDate" : currentDate, 
		"lastDate": lastDate
	}
}

function importShareHistory_YahooFin(index, code, res) {
	ShareHistory.findOne({
		index: index,
		code: code
	}, function(err, shareHistory) {
		var result = false;
		if(!shareHistory) {
			var lastDate = new Date();
			lastDate.setYear(lastDate.getFullYear()-5);

			var history = fetchShareHistory_YahooFin(index, code, lastDate);
			history.then((data) => {

				if(!data) {
					console.log("*** Shares - No data receieved. Index: " + index + ", Code: " + code + " ***");
					updateHistoryRes.updates.push({index: index, code: code, updated: false, status: `failed`});
					result = false;
				}
				else {
					var shareData = {
						"index": index,
						"code": code,
						"history": data,
						"lastUpdateDate": new Date()
					}
					//Create share history entry
					var newShareHistory = new ShareHistory(shareData)
					newShareHistory.save()
					updateHistoryRes.updates.push({index: index, code: code, updated: true, status: 'ok'});
					console.log("*** Shares - Added history for Index: " + index + ", Code: " + code + " ***");
					result = true;
				}

				incrementHistoryCounter(res);
			});
		}
		else {
			if(shareHistory.history.length > 0) {
				var currentDate = new Date();

				//Only check updates on Mon-Fri
				if(isUpdateRequired(shareHistory, currentDate)) {
					var history = fetchShareHistory_YahooFin(index, code, new Date(shareHistory.history[0].date));
					history.then((data) => {
						if(!data) {
							console.log("*** Shares - No data receieved. Index: " + index + ", Code: " + code + " ***");
							updateHistoryRes.updates.push({index: index, code: code, updated: false, status: `failed`});
							result = false;
						}
						else {
							shareHistory.history = data.concat(shareHistory.history);
							shareHistory.lastUpdateDate = currentDate;
							shareHistory.save();
							console.log("*** Shares - Completed updating share history for Index: " + index + " Code: " + code + " ***");	
							updateHistoryRes.updates.push({index: index, code: code, updated: true, status: 'ok'});
							result = true;
						}

						incrementHistoryCounter(res);
					})
				}
				else {
					updateHistoryRes.updates.push({index: index, code: code, updated: false, status: 'ok'});
					incrementHistoryCounter(res);
				}
			}
		}
		return result;
	});
}

function incrementHistoryCounter(res) {
	if(++updateHistoryCounter == updateHistorySize) {
		console.log("End - Counter: " + updateHistoryCounter + ", Size: " + updateHistorySize);
		res.send(updateHistoryRes);
		updateHistoryInProgress = false;
		updateHistoryRes = null;
		updateHistoryCounter = 0;
		updateHistorySize = 0;
	}
	else {
		console.log("Counter: " + updateHistoryCounter + ", Size: " + updateHistorySize);
	}
}


function fetchShareHistory_YahooFin(index, code, lastDate) {
	var stockIndex = index;
	if(index.toUpperCase() == "ASX") {
		stockIndex = "AX";
	}

	//Start date
	var date = new Date();
	if(date.getHours < 16 || (date.getHours == 16 && date.getMinutes < 30)) {
		date.setHours(0,0,0,0);
	}

	console.log(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data?frequency=1d&filter=history&period1=${Math.round(lastDate.getTime()/1000)}&period2=${Math.round(date.getTime()/1000)}&symbol=${code}.${stockIndex}`);

	return fetch(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data?frequency=1d&filter=history&period1=${Math.round(lastDate.getTime()/1000)}&period2=${Math.round(date.getTime()/1000)}&symbol=${code}.${stockIndex}`, {
		"method": "GET",
		"headers": {
			"x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
			"x-rapidapi-key": RapidApiKey
		}
	})
	.then(res => res.json()) 
	.then((data) => {
		if(!data || !data.prices) {
			console.log(data);
			return null;
		}

		var history = [];
		for(var i=0; i<data.prices.length; i++) {
			var date = new Date(data.prices[i].date * 1000);
			date.setHours(0,0,0,0);

			if(lastDate && date.getTime() <= lastDate.getTime()) {
				break;
			}
			
			console.log(code + " | Adding share data for: " + date);

			var dailyShareData = {
				"date" : date.getTime(),
				"open" : data.prices[i].open,
				"close" : data.prices[i].close,
				"high" : data.prices[i].high,
				"low" : data.prices[i].low,
			}

			history.push(dailyShareData);
		}
		return history;
	})
	.catch(err => {
		console.log(err);
	});
}

//Obsolete
function importShareHistory_AlphaAdvantage(index, code) {

	if(code == "WEB") {
		return false;
	}

	console.log("*** Shares - Importing share history for Index: " + index + " Code: " + code + " ***");
	
	ShareHistory.findOne({
		index: index,
		code: code
	}, function(err, shareHistory) {
		if(!shareHistory) {
			//share does not exist
			var lastDate = new Date();
			lastDate.setYear(lastDate.getFullYear()-5);

			var history = fetchShareHistory_AlphaAdvantage(index, code, lastDate)		
			history.then((data) => {
				if(!data || data.length == 0) {
					console.log("*** Shares - Could not retrieve history for Index: " + index + ", Code: " + code + " ***");
					console.log("*** Shares - Attempt to fetch history again in 60 seconds for Index: " + index + ", Code: " + code + " ***");
					setTimeout(() => {
							importShareHistory(index, code);
					}, 60000);
				}
				else {
					console.log("*** Shares - history does not exist for Index: " + index + ", Code: " + code + " ***");
					var shareData = {
						"index": index,
						"code": code,
						"history": data,
						"lastUpdateDate": new Date()
					}
					//Create share history entry
					var newShareHistory = new ShareHistory(shareData)
					newShareHistory.save()
					console.log("*** Shares - Added history for Index: " + index + ", Code: " + code + " ***");
					return true;
				}
			})
				
		}
		else {
			if(shareHistory.history.length > 0) {
				var currentDate = new Date();

				//Only check updates on Mon-Fri
				if(isUpdateRequired(shareHistory, currentDate)) {
					var history = fetchShareHistory_AlphaAdvantage(index, code, new Date(shareHistory.history[0].date));
					history.then((data) => {
						if(!data || data.length == 0) {
							console.log("*** Shares - Could not retrieve history for Index: " + index + ", Code: " + code + " ***");
							console.log("*** Shares - Attempt to fetch history again in 60 seconds for Index: " + index + ", Code: " + code + " ***");
							setTimeout(() => {
								importShareHistory(index, code);
							}, 60000);
						}
						else {
							console.log("*** Shares - Updating share history for Index: " + index + " Code: " + code + " ***");
							shareHistory.history = data.concat(shareHistory.history);
							shareHistory.lastUpdateDate = currentDate;
							shareHistory.save();
							console.log("*** Shares - Completed updating share history for Index: " + index + " Code: " + code + " ***");	
						}
						return true;
					})
				}
				else {
					return false;
				}
			}
		}
	});
}

function isUpdateRequired(shareHistory, currentDate) {

	var lastUpdateDate = new Date(shareHistory.lastUpdateDate);

	//Check if update happened today
	if(lastUpdateDate.getDate() == currentDate.getDate() &&
		lastUpdateDate.getMonth() == currentDate.getMonth() &&
		lastUpdateDate.getFullYear() == currentDate.getFullYear()) {
		
		//Check that the last update was after 4:30pm today
		if(lastUpdateDate.getHours() > 16 || (lastUpdateDate.getHours() == 16 && lastUpdateDate.getMinutes() >= 30)) {
			console.log("*** Shares - No update required, last update was today after market closed Index: " + shareHistory.index + " Code: " + shareHistory.code)
			return false;
		}
		else {
			//No update required on weekend if already done
			if(currentDate.getDay() == 6 || currentDate.getDay() == 7) {
				console.log("*** Shares - No update required on weekend, already up to date. Index: " + shareHistory.index + " Code: " + shareHistory.code)
				return false;
			}
			
			//Do not update if not past 4:30pm today
			if(currentDate.getHours() < 16 || (currentDate.getHours() == 16 && currentDate.getMinutes() < 30)) {
				console.log("*** Shares - No update required. Next update after 4:30pm today. Index: " + shareHistory.index + " Code: " + shareHistory.code)
				return false;
			}

			return true;
		}
	}
	else { //Update didn't happen today
		if(currentDate.getDay() <= 5) { //If current day is Mon - Fri
			var lastUpdateMidnight = new Date(lastUpdateDate.getTime())
			lastUpdateMidnight.setHours(0,0,0,0);
			var currentDateMidnight = new Date(currentDate.getTime());
			currentDateMidnight.setHours(0,0,0,0);

			//Check if last update was on the previous business day - if so only update after 4:30pm today
			if((currentDateMidnight.getDay() == 1 && (currentDateMidnight - lastUpdateMidnight) == 86400000*3) || 
				(currentDateMidnight - lastUpdateMidnight) == 86400000) {
				if(currentDate.getHours() < 16 || (currentDate.getHours() == 16 && currentDate.getMinutes() < 30)) {
					console.log("*** Shares - No update required, last update was market close of previous business day. Next update will be after market close today. Index: " + shareHistory.index + " Code: " + shareHistory.code)
					return false;
				}
			}
			console.log("*** Shares - Update required. Index: " + shareHistory.index + " Code: " + shareHistory.code)
			return true;
		}
		else { //If weekend, check if update happened last Friday
			let daysSinceLastFriday = currentDate.getDay() - 5;
			let lastFridayDate = new Date(currentDate.getTime() - daysSinceLastFriday * 86400000);
			lastFridayDate.setHours(16,30,0,0);

			if(lastUpdateDate.getTime() > lastFridayDate.getTime())
			{ //Last update was on the last friday after 5pm
				console.log("*** Shares - No update required, last update was after the market closed last Friday. Index: " + shareHistory.index + " Code: " + shareHistory.code)
				return false;
			}
			else { //Last update was before friday 4:30pm
				console.log("*** Shares - Update required - Last update before friday 4:30pm. Index: " + shareHistory.index + " Code: " + shareHistory.code)
				return true;
			}
		}
	}
}

//Obsolete
function fetchShareHistory_AlphaAdvantage(index, code, lastDate) {
	var stockIndex = index;
	if(index.toUpperCase() == "ASX") {
		stockIndex = "AX";
	}
	return fetch(AlphaAdvantageUrl+'function=TIME_SERIES_DAILY&symbol=' + code + '.' + stockIndex + '&outputsize=full&apikey=' + AlphaAdvantageAPIKey, {mode: 'cors'})
	.then(res => res.json()) //parses output to json
	.then((data) => {
		var history = [];
		console.log(AlphaAdvantageUrl+'function=TIME_SERIES_DAILY&symbol=' + code + '.' + stockIndex + '&outputsize=full&apikey=' + AlphaAdvantageAPIKey);
		if(!data["Time Series (Daily)"]) {
			console.log(data);
			return null;
		}
		var keys = Object.keys(data["Time Series (Daily)"]);
		for(var i=0; i<keys.length; i++) {
			var date = new Date(keys[i]);
			date.setHours(0,0,0,0);

			if(lastDate && date.getTime() <= lastDate.getTime()) {
				break;
			}

			var open = parseFloat(data["Time Series (Daily)"][keys[i]]["1. open"])
			var close = parseFloat(data["Time Series (Daily)"][keys[i]]["4. close"])
			var low = parseFloat(data["Time Series (Daily)"][keys[i]]["3. low"])
			var high = parseFloat(data["Time Series (Daily)"][keys[i]]["2. high"])

			var dailyShareData = {
				"date" : date.getTime(),
				"open" : open,
				"close" : close,
				"high" : high,
				"low" : low,
			}

			history.push(dailyShareData);
		}

		return history;
	})
	.catch(console.log)
}