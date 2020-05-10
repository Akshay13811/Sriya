'use strict'

var mongoose = require('mongoose');
var Asset = mongoose.model('Asset');
var Value = mongoose.model('AssetValue');
var CSV = require('csv-string');

const DAYINMS = 86400000;

exports.list_assets = function(req, res) {
	Asset.find({}, function(err, assets) {
		if(err)
			res.send(err);
		res.json(assets)
	});
}

exports.create_asset = function(req, res) {
	console.log("*** Creating Asset - Name: " + req.body.name);
	if(req.body.valuations) {
		req.body.valuations = JSON.parse(req.body.valuations);
	}
	var newAsset = new Asset(req.body);
	
	newAsset.save(function(err, asset) {
		if(err)
			res.send(err);
		res.json(asset);
	});
}

exports.delete_asset = function(req, res) {
	console.log("*** Deleting Asset ***")
	Asset.deleteOne({
		_id: req.params.assetId
	}, function(err, asset) {
		if (err)
			res.send(err)
		res.json({ message: 'Asset successfully deleted' , success: true});
	})
}

exports.update_asset = function(req, res) {
	console.log("*** Updating asset ***")
	Asset.findOne({
		_id: req.params.assetId
	}, function(err, asset) {
		if(req.body.name) {
			asset.name = req.body.name;
		}

		if(req.body.description) {
			asset.description = req.body.description;
		}

		if(req.body.soldDate) {
			asset.soldDate = req.body.soldDate;
		}

		if(req.body.valuations) {
			asset.valuations = JSON.parse(req.body.valuations);
		}

		asset.save();

		if (err)
			res.send(err)
		res.json({ asset: asset, success: true});
	})
}

exports.list_valuations = function(req, res) {
	Asset.findOne({
		_id: req.params.assetId
	}, function(err, asset) {
		if(err)
			res.send(err);
		else if(!asset)
			res.send({message: 'Specified asset not found'})
		else
			res.json(asset.valuations)
	});
}

exports.create_valuation = function(req, res) {
	Asset.findOne({
		_id: req.params.assetId
	}, function(err, asset) {
		if(err)
			res.send(err);
		else if(!asset)
			res.send({message: 'Specified asset not found'})
		else {
			var newValue = new Value(req.body);
			asset.valuations.push(newValue)
			asset.valuations.sort((x, y) => y.date - x.date);
			asset.save();
			res.json({ asset: asset , success: true});
		}
	});
}

exports.delete_valuation = function(req, res) {
	Asset.update({
		_id: req.params.assetId
	}, {
		$pull: {
			valuations: {
				_id: req.params.valuationId
			}
		}
	},function(err, asset) {
		if (err)
			res.send(err)
		res.json({ asset: asset, success: true });
	})
}

exports.update_valuation = function(req, res) {
	var update = req.body;
	update._id = req.params.valuationId
	Asset.findOneAndUpdate({
		_id: req.params.assetId,
		"valuations._id": req.params.valuationId
	}, {
		$set: {
			"valuations.$": update
		}
	}, {
		new: true
	}, function(err, asset) {
		if (err)
			res.send(err)
		res.json(asset);
	})	
}

exports.graph_all_data = function(req, res) {
	processGraphData(parseInt(req.params.graphPeriod), parseInt(req.params.graphInterval), res);
}

exports.get_total = function(req, res) {
	Asset.find({}, function(err, assets) {
		var total = 0;
		for(var i=0; i<assets.length; i++) {
			if(assets[i].valuations.length > 0) {
				total += assets[i].valuations[0].value;
			}
		}
		res.json({"total" : total})
	});
}

exports.get_all_assets_query = getAllAssetsQuery
exports.get_combined_graph_data = getCombinedGraphData

function getAllAssetsQuery() {
	var query = Asset.find({});
	return query;
}

function getCombinedGraphData(assets, period, interval) {
	var assetsData = [];
	for(var i=0; i<assets.length; i++) {
		assetsData.push(calculateGraphData(assets[i], period, interval));
	}
	var graphData = combineAllData(assetsData, period, interval);
	return graphData;
}

function processGraphData(period, interval, res) {
	var graphData = {}; 

	if(interval > period) {
		res.send({error: "Requested interval cannot be larger than period"})
		return;
	}

	Asset.find({}).then(assets => {
			graphData = getCombinedGraphData(assets, period, interval);
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


function calculateGraphData(assetData, timePeriod, timeInterval) {
	
	var interval = DAYINMS*timeInterval;
	
	//Get current data
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	var lastDate = currentDate.getTime() - DAYINMS*timePeriod;

	var data = {}

	if(assetData.soldDate) {
		while(currentDate.getTime() > assetData.soldDate && currentDate.getTime() >= lastDate) {
			data[currentDate.getTime()] = 0;
			var updatedDates = getNextDates(currentDate, lastDate, interval);
			currentDate = updatedDates.currentDate;
			lastDate = updatedDates.lastDate;
		}
	}

	for(var i=0; i<assetData.valuations.length; i++) {
		while(currentDate.getTime() >= assetData.valuations[i].date && currentDate.getTime() >= lastDate) {
			data[currentDate.getTime()] = assetData.valuations[i].value / 100;
			var updatedDates = getNextDates(currentDate, lastDate, interval);
			currentDate = updatedDates.currentDate;
			lastDate = updatedDates.lastDate;
		}
	}

	//Fill out all remaining dates with the current balance
	while(currentDate >= lastDate) {
		data[currentDate.getTime()] = 0;
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