'use strict'

var mongoose = require('mongoose');
var Account = mongoose.model('Accounts');
var Transaction = mongoose.model('Transactions');

exports.list_accounts = function(req, res) {
	Account.find({}, function(err, account) {
		if(err)
			res.send(err);
		res.json(account)
	});
}

exports.create_account = function(req, res) {
	var new_account = new Account(req.body);
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