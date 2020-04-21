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
	console.log("*** Updating share ***")
	Asset.findOne({
		_id: req.params.assetId
	}, function(err, asset) {
		asset.name = req.body.name;
		asset.description = req.body.description;
		asset.purchaseDate = req.body.purchaseDate;
		asset.soldDate = req.body.soldDate;

		share.save();

		if (err)
			res.send(err)
		res.json({ message: 'Share successfully updated' , success: true});
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
			asset.save();
			res.json(asset.valuations)
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
		res.json({ message: 'Valuation successfully deleted' });
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

}