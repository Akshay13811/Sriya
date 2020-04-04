import React from 'react';

//Images
import {ReactComponent as MenuIcon} from '../images/menu2.svg';
import {ReactComponent as BankIcon} from '../images/bank2.svg';
import {ReactComponent as SharesIcon} from '../images/shares2.svg';
import {ReactComponent as HomeIcon} from '../images/home2.svg';

//Interfaces
import {IAccount} from '../interfaces/IAccount';

//Components
import {BankDialog, BankName} from '../Components/Dialogs/BankDialog'

//Images
import ingIcon from '../images/ing.jpg';
import ubankIcon from '../images/ubank.jpg';
import commbankIcon from '../images/commbank.png';

//Constants
import {EndpointUrl} from '../Configuration';

interface IDashboardBarProps {
	accounts: Array<IAccount>
	refreshAccountData: () => void;
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

	hideBankDialog() {
		this.setState({
			showBankDialog: false
		})	
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	render() {
		return (
			<div>
				<div className="dashboard-menu-bar">
					<div className="dashboard-menu-button menu-icon">
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

				<BankDialog 
						showDialog = {this.state.showBankDialog}
						hideDialogCallback = {() => this.hideBankDialog()}
						accounts = {this.props.accounts}
						refreshAccountData = {() => this.props.refreshAccountData()}
				/>
			</div>
		);
	}
}
