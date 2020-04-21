'use strict'

var mongoose = require('mongoose');
var Share = mongoose.model('Share')
var ShareHistory = mongoose.model('ShareHistory')

const fetch = require("node-fetch");

const AlphaAdvantageUrl = 'https://www.alphavantage.co/query?';
const AlphaAdvantageAPIKey = 'MEFRXCIZH7KIKI26';
const DemoKey = 'demo';

const DAYINMS = 86400000;

/* --- Shares --- */

exports.list_shares = function(req, res) {
	console.log("*** Listing Shares ***");
	Share.find({}, function(err, shares) {
		if(err)
			res.send(err);
		res.json(shares)
	});
}

exports.list_combined_shares = function(req, res) {
	console.log("*** Listing Shares - Combined ***");
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
	console.log("*** Creating Share Entry - Index: " + req.body.index + ", Code: " + req.body.code);
	var newShare = new Share(req.body);
	newShare.index = newShare.index.toUpperCase();
	newShare.code = newShare.code.toUpperCase();
	
	newShare.save(function(err, share) {
		if(err)
			res.send(err);
		res.json(share);
	});

	importShareHistory(req.body.index, req.body.code);
}

exports.delete_share = function(req, res) {
	console.log("*** Deleting share ***")
	Share.deleteOne({
		_id: req.params.shareId
	}, function(err, share) {
		if (err)
			res.send(err)
		res.json({ message: 'Share successfully deleted' , success: true});
	})
}

exports.update_share = function(req, res) {
	console.log("*** Updating share ***")
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

exports.get_daily_share_data = function(req, res) {
	console.log("*** Getting Daily Share Data ***")
	ShareHistory.findOne({
		index: req.params.index.toUpperCase(),
		code: req.params.code.toUpperCase()
	}, function(err, shareHistory) {
		if(err) {
			res.send(err);
			return;
		}

		if(!shareHistory) {
			res.send("Share entry invalid");
			return;
		}

		if(shareHistory.history.length == 0) {
			res.send("No history");
			return;
		}

		res.send({
			currentSharePrice: shareHistory.history[0].close,
			lastCloseSharePrice: shareHistory.history[1].close
		})
	});
}

exports.update_history = function(req, res) {
	console.log("*** Updating History *** ")
	Share.find({}, function(err, shares) {
		for(var i=0; i<shares.length; i++) {
			importShareHistory(shares[i].index, shares[i].code);
		}
	});
	res.send("Updated History");
}

exports.graph_all_data = function(req, res) {
	Share.find({}, async function(err, shares) {
		if(err)
			res.send(err);

		var graphData = {};
		if(parseInt(req.params.graphInterval) > parseInt(req.params.graphPeriod)) {
			res.send("Requested interval cannot be larger than period")
		}
		else {
			var sharesData = [];
			for(var i=0; i<shares.length; i++) {
				sharesData.push(await calculateGraphData(shares[i], parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval)));
			}
			graphData = combineAllData(sharesData, parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval));
		}
		res.json(graphData)
	});
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
		lastDate = updatedDates.lastDate;	}

	return combinedData;
}

async function calculateGraphData(share, timePeriod, timeInterval) {
	console.log("Getting graph data for " + share.index + ":" + share.code)

	//TODO: WEB stock seems to be having issues so will skip it here
	if(share.code == "WEB") {
		return {};
	}

	var interval = DAYINMS*timeInterval;

	//Get current data
	var currentDate = new Date();
	currentDate.setHours(0,0,0,0);

	var findingLastClose = false;
	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	var data = {};
	while(currentDate.getTime() >= lastDate || findingLastClose) {

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

		if(!shareHistory[0] && currentDate.getTime() == lastDate) { //No history exists for the last date - continue to search backwards for the next record
			console.log("finding last close");
			findingLastClose = true;
		}
		else if(!shareHistory[0]) {
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
		else if(shareHistory[0] && !findingLastClose) {
			data[currentDate.getTime()] = parseFloat(share.numberOfShares) * parseFloat(shareHistory[0].history.close);
		}
		else if(shareHistory[0] && findingLastClose) {
			//Found last close price for last date
			findingLastClose = false;
			data[lastDate] = parseFloat(share.numberOfShares) * parseFloat(shareHistory[0].history.close);				
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

	if(oldTimeOffset != newTimeOffset) { //Compenstate for DST
		currentDate = new Date(currentDate.getTime() + ((newTimeOffset - oldTimeOffset) * 60 * 1000));
		lastDate = lastDate + ((newTimeOffset - oldTimeOffset) * 60 * 1000);
	}

	return {
		"currentDate" : currentDate, 
		"lastDate": lastDate
	}
}

function importShareHistory(index, code) {

	console.log("Importing share history for Index: " + index + " Code: " + code);
	
	ShareHistory.findOne({
		index: index,
		code: code
	}, function(err, shareHistory) {
		if(!shareHistory) {
			//share does not exist
			console.log("Share history does not exist");
			var history = fetchShareHistory(index, code)
			history.then((data) => {
				console.log("Updating share history");
				
				var shareData = {
					"index": index,
					"code": code,
					"history": data,
					"lastUpdateDate": new Date()
				}
		
				//Create share history entry
				var newShareHistory = new ShareHistory(shareData)
				newShareHistory.save()
				return true;
			})
		}
		else {
			if(shareHistory.history.length > 0) {
				var currentDate = new Date();

				//Only check updates on Mon-Fri
				if(isUpdateRequired(shareHistory, currentDate)) {
					var history = fetchShareHistory(index, code, currentDate);
					history.then((data) => {
						console.log("Updating share history");
						shareHistory.history = data.concat(shareHistory.history);
						shareHistory.lastUpdateDate = currentDate;
						shareHistory.save();
						return true;
					})
				}
				else {
					return false;
				}
			}
			else {
				//No history exists - populate the history
				var history = fetchShareHistory(index, code)
				history.then((data) => {
					console.log("Updating share history");
					shareHistory.history = data.concat(shareHistory.history);
					shareHistory.lastUpdateDate = currentDate;
					shareHistory.save();
					return true;
				})
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
		
		//Check that the last update was after 5pm on a Mon-Fri
		if(lastUpdateDate.getHours() >= 17) {
			console.log("No update required, last update was today after market closed")
			return false;
		}
		else {
			//No update required on weekend if already done
			if(currentDate.getDay() == 6 || currentDate.getDay() == 7) {
				console.log("No update required on weekend, already up to date")
				return false;
			}
			return true;
		}
	}
	else { //Update didn't happen today
		if(currentDate.getDay <= 5) { //If current day is Mon - Fri
			return true;
		}
		else { //If weekend, check if update happened last Friday
			let daysSinceLastFriday = currentDate.getDay() - 5;
			let lastFridayDate = new Date(currentDate.getTime() - daysSinceLastFriday * 86400000);
			lastFridayDate.setHours(17,0,0,0);

			if(lastUpdateDate.getTime() > lastFridayDate.getTime())
			{ //Last update was on the last friday after 5pm
				console.log("No update required, last update was after the market closed last Friday")
				return false;
			}
			else { //Last update was before friday 5pm
				return true;
			}
		}
	}
}

function fetchShareHistory(index, code, lastDate) {
	var stockIndex = index;
	if(index.toUpperCase() == "ASX") {
		stockIndex = "AX";
	}
	return fetch(AlphaAdvantageUrl+'function=TIME_SERIES_DAILY&symbol=' + code + '.' + stockIndex + '&outputsize=full&apikey=' + AlphaAdvantageAPIKey, {mode: 'cors'})
	.then(res => res.json()) //parses output to json
	.then((data) => {
		var history = [];
		var keys = Object.keys(data["Time Series (Daily)"]);
		for(var i=0; i<keys.length; i++) {
			var date = new Date(keys[i]);
			date.setHours(0,0,0,0);

			if(lastDate && lastDate <= date) {
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