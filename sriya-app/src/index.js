import React from 'react';
import ReactDOM from 'react-dom';

//CSS
import './css/index.css';

//3rd party
import {Line} from 'react-chartjs-2';

//Images
import {ReactComponent as MenuIcon} from './images/menu2.svg';
import {ReactComponent as BankIcon} from './images/bank2.svg';
import {ReactComponent as SharesIcon} from './images/shares2.svg';
import {ReactComponent as HomeIcon} from './images/home2.svg';
import {ReactComponent as DropdownIcon} from './images/dropdown.svg';

import ingIcon from './images/ing.jpg';
import ubankIcon from './images/ubank.jpg';
import commbankIcon from './images/commbank.png';

var endpointUrl = 'http://localhost:3002';

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const ChartPeriods = {
	WEEK: {
		//1 Week
		period: 7,
		interval: 1
	},
	ONEMONTH: {
		//1 Month
		period: 28,
		interval: 7
	},
	THREEMONTHS: {
		//3 Months
		period: 90,
		interval: 15
	},
	SIXMONTHS: {
		//6 Months
		period: 180,
		interval: 60
	},
	ONEYEAR: {
		//1 Year
		period: 365,
		interval: 90
	},
	THREEYEARS: {
		//3 Years
		period: 365*3,
		interval: 365*0.5
	},
	FIVEYEARS: {
		//5 Years
		period: 365*5,
		interval: 365
	}
}

class Chart extends React.Component {

	getStepSize(numOfSteps) {
		var data = Object.values(this.props.data);

		if(data.length == 0)
			return null;
	
		var min = data[0];
		var max = data[0];
		for(var i=0; i<data.length; i++) {
			if(data[i] < min)
				min = data[i];
			if(data[i] > max)
				max = data[i];
		}
	
		var range = max - min;
		var magnitude = Math.pow(10, Math.floor(range).toString().length - 1);
		var roundedRange = (Math.round(range / magnitude) * magnitude);
	
		return roundedRange/numOfSteps;
	}

	getLabels() {
		var labels = [];
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

		if(this.props.period == ChartPeriods.WEEK.period) {
			var keys = Object.keys(this.props.data);
			for(var key in keys) {
				var date = new Date(key);
				labels.push(days[date.getDay()]);
			}
		}
		else if(this.props.period == ChartPeriods.ONEMONTH.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(date.getDate() + '-' + months[date.getMonth()])
			}
		}
		else if(this.props.period == ChartPeriods.THREEMONTHS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(date.getDate() + '-' + months[date.getMonth()])
			}
		}
		else if(this.props.period == ChartPeriods.SIXMONTHS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.period == ChartPeriods.ONEYEAR.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.period == ChartPeriods.THREEYEARS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.period == ChartPeriods.FIVEYEARS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(date.getFullYear())
			}
		}
		
		return labels;
	}

	render() {
		var stepSize = this.getStepSize(4);
		var labels = this.getLabels();

		var data = {
			labels: labels.reverse(),
			datasets: [{
				label: this.props.title,
				fill: false,
				backgroundColor: [this.props.color],
				borderColor: [this.props.color],
				data: Object.values(this.props.data).reverse()
			}]
		}

		return (
			<div className="dashboard-chart">
				<Line
					data={data}
					options={{
						maintainAspectRatio: false,
						legend: {
						display: false
						},
						scales: {
							xAxes: [{
								gridLines: {
									display: false,
									drawTicks: true,	
								},
								ticks: {
									fontColor: 'rgba(255,255,255,1)'
								}
							}],
							yAxes: [{
								gridLines: {
									color: 'rgba(255,255,255,0.1)',
									lineWidth: 5,
								},
								ticks: {
									fontColor: 'rgba(255,255,255,1)',
									stepSize: [stepSize],
									callback: function(value, index, values) {
										return '$' + value;
									}
								}
							}]
						}
					}}
				/>
			</div>
		);
	}
}

class AccountCard extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			interval: 7,
			period: 28,
			showDropdown: false
		}
	}
	
	fetchAccountGraphData() {
		fetch(endpointUrl+'/accounts/graph/'+this.state.period+'/'+this.state.interval, {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				data: data
			})
		})
		.catch(console.log)
	}

	componentDidMount() {
		this.fetchAccountGraphData();
	}

	showDropdown() {
		this.setState({
			showDropdown: true
		});
	}

	hideDropdown() {
		this.setState({
			showDropdown: false
		});
	}

	changeGraphPeriod(period, interval) {
		this.setState({
			period: period,
			interval: interval
		}, () => {
			this.fetchAccountGraphData();
		})
	}

	render() {
		return (
			<div className="dashboard-card">
				<div className="dashboard-card-header">{"Cash Total"}</div>
				<div className="dashboard-chart-options">
					<div className={this.state.period == ChartPeriods.WEEK.period ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
						onClick={() => this.changeGraphPeriod(ChartPeriods.WEEK.period, ChartPeriods.WEEK.interval)}>
						1 Week
					</div>
					<div className={this.state.period == ChartPeriods.ONEMONTH.period ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
						onClick={() => this.changeGraphPeriod(ChartPeriods.ONEMONTH.period, ChartPeriods.ONEMONTH.interval)}>
						1 Month
					</div>
					<div className={this.state.period == ChartPeriods.THREEMONTHS.period ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
						onClick={() => this.changeGraphPeriod(ChartPeriods.THREEMONTHS.period, ChartPeriods.THREEMONTHS.interval)}>
						3 Months
					</div>
					<div className="dashboard-chart-option" onMouseOver={() => this.showDropdown()} onMouseLeave={() => this.hideDropdown()}>
						<DropdownIcon />
						<div className={this.state.showDropdown ? "dashboard-chart-dropdown fadeIn" : "dashboard-chart-dropdown fadeOut"} >
							<div className={this.state.period == ChartPeriods.SIXMONTHS.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.SIXMONTHS.period, ChartPeriods.SIXMONTHS.interval)}>
								6 Months
							</div>
							<div className={this.state.period == ChartPeriods.ONEYEAR.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.ONEYEAR.period, ChartPeriods.ONEYEAR.interval)}>
								1 Year
							</div>
							<div className={this.state.period == ChartPeriods.THREEYEARS.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.THREEYEARS.period, ChartPeriods.THREEYEARS.interval)}>
								3 Years
							</div>
							<div className={this.state.period == ChartPeriods.FIVEYEARS.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.FIVEYEARS.period, ChartPeriods.FIVEYEARS.interval)}>
								5 Years
							</div>
						</div>
					</div>
				</div>
				<Chart 
					data={this.state.data}
					interval={this.state.interval}
					period={this.state.period}
					color={'rgba(116,184,255,1)'}
				/>
			</div>
		);
	}
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			accounts: [],
		}
	}

	componentDidMount() {
		this.fetchAccountData();
	}

	fetchAccountData() {
		fetch(endpointUrl+'/accounts', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				accounts: data
			})
		})
		.catch(console.log)
	}

	renderAccountCard() {
		return (
			<AccountCard
				accounts={this.state.accounts}
			/>
		)
	}

	renderBar() {
		return (
			<DashboardBar
				accounts={this.state.accounts}
			/>
		)
	}

	render() {
		return(
			<div className="dashboard">
				<div>
					{this.renderBar()}
				</div>
				<div className="dashboard-main-container">
					{this.renderAccountCard()}
				</div>
			</div>
		)
	}
}

// ==========================================

class BankCard extends React.Component {
	render() {
		return (
			<div className="dashboard-bank-card">
				<div className="dashboard-bank-card-name">
					{this.props.account.name}
				</div>
				<div className="dashboard-bank-card-amount">
					${numberWithCommas(this.props.account.current_balance)}
				</div>
			</div>
		)
	}
}

class BankDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			addingAccount: false,
			addAccountStage: 0
		}
	}

	createBankAccount() {
		this.setState({
			addingAccount: true
		})
	}

	goToBankInput() {
		this.setState({	
			addAccountStage: 1
		})
	}

	goBack() {
		if(!this.state.addingAccount) {
			return;
		}
		if(this.state.addAccountStage == 0) {
			this.setState({	
				addingAccount: false
			})
		}
		else if(this.state.addAccountStage == 1) {
			this.setState({	
				addAccountStage: 0
			})
		}
	}

	buttonString() {
		if(!this.state.addingAccount) {
			return "Add"
		}
		else {
			return "Submit"
		}
	}

	buttonEnabled() {
		if(!this.state.addingAccount) {
			return true;
		}
		else if(this.state.addAccountStage == 0) {
			return false;
		}
		else {
			return true;
		}
	}

	dialogClick(e) {
		e.stopPropagation();
	}

	render() {

		//Reset dialog if closed
		if(!this.props.showDialog && (this.state.addingAccount || this.state.addAccountStage != 0)) {
			this.setState({
				addingAccount: false,
				addAccountStage: 0
			})
		}

		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog' : 'dashboard-menu-dialog hidden'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-bank-dialog">
					<div className="dashboard-dialog-header">
						Bank Accounts
					</div>
					<div className="dashboard-dialog-container">
						{
							(() => {
								if (this.state.addingAccount || this.props.accounts.length > 0) {
									return (
										<div className="dashboard-bank-form">
											<div className={(!this.state.addingAccount && this.props.accounts.length > 0) ? 'dashboard-bank-summary fadeIn' : 'dashboard-bank-summary fadeOut'}>
												{this.props.accounts.map(account => (
													<BankCard
														account = {account}
													/>
												))}
											</div>
											<div className={(!this.state.addingAccount && this.props.accounts.length == 0) ? 'dashboard-bank-summary fadeIn' : 'dashboard-bank-summary fadeOut'}>
												<p>You do not have any bank accounts</p>	
											</div>
											<div className={(this.state.addingAccount && this.state.addAccountStage == 0) ? 'dashboard-bank-form-bank-list fadeIn' : 'dashboard-bank-form-bank-list fadeOut'}>
												<div className="dashboard-bank-form-bank-option" onClick={() => this.goToBankInput()}>
													<img src={ingIcon}></img>
												</div>
												<div className="dashboard-bank-form-bank-option">
													<img src={ubankIcon}></img>
												</div>
												<div className="dashboard-bank-form-bank-option">
													<img src={commbankIcon}></img>
												</div>
											</div>
											<div className={this.state.addAccountStage == 1 ? 'dashboard-bank-form-input fadeIn' : 'dashboard-bank-form-input fadeOut'}>
												<label>Account Name</label>
												<input type="text"/>
												<label>Current Balance</label>
												<input type="text"/>
												<label>Import Bank File</label>
												<input type="file" />
											</div>
										</div>
									)
								}
							})()
						}
					</div>
					<div className='dashboard-dialog-neutral-button' onClick={() => this.goBack()}>
						Back
					</div>
					<div className={this.buttonEnabled() ? 'dashboard-dialog-green-button' : 'dashboard-dialog-green-button green-button-disabled'} onClick={() => this.createBankAccount()}>
						{this.buttonString()}
					</div>
				</div>
			</div>				
		)
	}
}

class DashboardBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showBankDialog: false,
			showSharesDialog: false,
			showAssetsDialog: false
		}
	}

	toggleMenu() {
		//TODO - expand menu
	}

	openBankDialog() {
		var newBankDialog = this.state.showBankDialog ? false : true;
		this.setState({
			showBankDialog: newBankDialog
		})
	}

	openSharesDialog() {
		var newSharesDialog = this.state.showSharesDialog ? false : true;
		this.setState({
			showSharesDialog: newSharesDialog
		})
	}

	openAssetsDialog() {
		var newAssetsDialog = this.state.showAssetsDialog ? false : true;
		this.setState({
			showAssetsDialog: newAssetsDialog
		})
	}

	closeDialogs() {
		this.setState({
			showBankDialog: false,
			showSharesDialog: false,
			showAssetsDialog: false
		})		
	}

	showDialog() {
		return this.state.showBankDialog || this.state.showSharesDialog || this.state.showAssetsDialog;
	}

	dialogClick(e) {
		e.stopPropagation();
	}

	render() {
		return (
			<div>
				<div className="dashboard-menu-bar">
					<div className="dashboard-menu-button menu-icon" onClick={() => this.toggleMenu()}>
						<MenuIcon />
					</div>
					<div className="dashboard-menu-button bank-icon" onClick={() => this.openBankDialog()}>
						<BankIcon />
					</div>
					<div className="dashboard-menu-button shares-icon" onClick={() => this.openSharesDialog()}>
						<SharesIcon />
					</div>
					<div className="dashboard-menu-button home-icon" onClick={() => this.openAssetsDialog()}>
						<HomeIcon />
					</div>
				</div>

				<div className={this.showDialog() ? 'dashboard-menu-dialogs fadeIn' : 'dashboard-menu-dialogs fadeOut'} onClick={() => this.closeDialogs()}>
					<BankDialog 
						showDialog = {this.state.showBankDialog}
						accounts = {this.props.accounts}
					/>
					<div className={this.state.showSharesDialog ? 'dashboard-menu-dialog' : 'dashboard-menu-dialog hidden'} onClick={(e) => this.dialogClick(e)}>
						SHARES
					</div>		
					<div className={this.state.showAssetsDialog ? 'dashboard-menu-dialog' : 'dashboard-menu-dialog hidden'} onClick={(e) => this.dialogClick(e)}>
						ASSETS
					</div>			
				</div>
			</div>
		);
	}
}

// ==========================================

ReactDOM.render(
	<Dashboard />,
	document.getElementById('root')	
);