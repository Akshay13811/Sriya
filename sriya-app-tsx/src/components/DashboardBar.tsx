import React from 'react';

//Images
import {ReactComponent as MenuIcon} from '../images/menu2.svg';
import {ReactComponent as BankIcon} from '../images/bank2.svg';
import {ReactComponent as SharesIcon} from '../images/shares2.svg';
import {ReactComponent as HomeIcon} from '../images/home2.svg';

//Interfaces
import {IAccount} from '../interfaces/IAccount';

//Images
import ingIcon from '../images/ing.jpg';
import ubankIcon from '../images/ubank.jpg';
import commbankIcon from '../images/commbank.png';


interface IBankCardProps {
	account: IAccount;
}

class BankCard extends React.Component<IBankCardProps> {
	
	numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	render() {
		return (
			<div className="dashboard-bank-card">
				<div className="dashboard-bank-card-name">
					{this.props.account.name}
				</div>
				<div className="dashboard-bank-card-amount">
					${this.numberWithCommas(this.props.account.current_balance)}
				</div>
			</div>
		)
	}
}

interface IBankDialogProps {
	showDialog: boolean;
	accounts: Array<IAccount>;
}
interface IBankDialogState {
	addingAccount: boolean;
	addAccountStage: number;
}

class BankDialog extends React.Component<IBankDialogProps, IBankDialogState> {

	constructor(props: IBankDialogProps) {
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

	dialogClick(e: React.MouseEvent) {
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

interface IDashboardBarProps {
	accounts: Array<IAccount>
}
interface IDashboardBarState {
	showBankDialog: boolean;
	showSharesDialog: boolean;
	showAssetsDialog: boolean;
}


export class DashboardBar extends React.Component<IDashboardBarProps, IDashboardBarState> {

	constructor(props: IDashboardBarProps) {
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

	dialogClick(e: React.MouseEvent) {
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
					<div className={this.state.showSharesDialog ? 'dashboard-menu-dialog' : 'dashboard-menu-dialog hidden'} onClick={(e: React.MouseEvent) => this.dialogClick(e)}>
						SHARES
					</div>		
					<div className={this.state.showAssetsDialog ? 'dashboard-menu-dialog' : 'dashboard-menu-dialog hidden'} onClick={(e: React.MouseEvent) => this.dialogClick(e)}>
						ASSETS
					</div>			
				</div>
			</div>
		);
	}
}
