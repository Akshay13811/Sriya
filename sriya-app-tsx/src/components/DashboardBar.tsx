import React from 'react';

//Images
import {ReactComponent as MenuIcon} from '../images/menu2.svg';
import {ReactComponent as BankIcon} from '../images/bank2.svg';
import {ReactComponent as SharesIcon} from '../images/shares2.svg';
import {ReactComponent as HomeIcon} from '../images/home2.svg';
import {ReactComponent as WalletIcon} from '../images/wallet2.svg';

//Interfaces
import { IAccount } from '../interfaces/IAccount';
import { IShare } from '../interfaces/IShare';
import { IAsset } from '../interfaces/IAsset';
import { ILoan } from '../interfaces/ILoan';

//Components
import { BankDialog } from '../Components/Dialogs/BankDialog'
import { SharesDialog } from './Dialogs/SharesDialog'
import { AssetsDialog } from './Dialogs/AssetsDialog'
import { LoansDialog } from './Dialogs/LoansDialog'
import { NotificationBar } from './NotificationBar'
import { NotificationInfo } from '../interfaces/INotification';

interface IDashboardBarProps {
	accounts: Array<IAccount>
	shares: Array<IShare>
	assets: Array<IAsset>
	loans: Array<ILoan>
	notifications: Array<NotificationInfo>
	refreshAccountData: () => void;
	refreshShareData: () => void;
	refreshAssetData: () => void;
	refreshLoanData: () => void;
}

interface IDashboardBarState {
	showNotificationBar: boolean;
	showBankDialog: boolean;
	showSharesDialog: boolean;
	showAssetsDialog: boolean;
	showLoansDialog: boolean;
}

export class DashboardBar extends React.Component<IDashboardBarProps, IDashboardBarState> {

	constructor(props: IDashboardBarProps) {
		super(props);
		this.state = {
			showNotificationBar: false,
			showBankDialog: false,
			showSharesDialog: false,
			showAssetsDialog: false,
			showLoansDialog: false
		}
	}

	toggleNotificationBar() {
		this.setState({
			showNotificationBar: !this.state.showNotificationBar
		})
	}

	openBankDialog() {
		this.setState({
			showBankDialog: !this.state.showBankDialog
		})
	}

	openSharesDialog() {
		this.setState({
			showSharesDialog: !this.state.showSharesDialog
		})
	}

	openAssetsDialog() {
		this.setState({
			showAssetsDialog: !this.state.showAssetsDialog
		})
	}

	openLoansDialog() {
		this.setState({
			showLoansDialog: !this.state.showLoansDialog
		})
	}

	closeDialogs() {
		this.setState({
			showBankDialog: false,
			showSharesDialog: false,
			showAssetsDialog: false,
			showLoansDialog: false
		})		
	}

	showDialog() {
		return this.state.showBankDialog || this.state.showSharesDialog || this.state.showAssetsDialog || this.state.showLoansDialog;
	}

	hideBankDialog() {
		this.setState({
			showBankDialog: false
		})	
	}

	hideSharesDialog() {
		this.setState({
			showSharesDialog: false
		})	
	}

	hideAssetsDialog() {
		this.setState({
			showAssetsDialog: false
		})
	}

	hideLoansDialog() {
		this.setState({
			showLoansDialog: false
		})
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	render() {
		return (
			<div>
				<div className="dashboard-menu-bar">
					<div className="dashboard-menu-button menu-icon" onClick={() => this.toggleNotificationBar()}>
						<MenuIcon />
					</div>
					<div className="dashboard-menu-button bank-icon" onClick={() => this.openBankDialog()}>
						<WalletIcon />
					</div>
					<div className="dashboard-menu-button shares-icon" onClick={() => this.openSharesDialog()}>
						<SharesIcon />
					</div>
					<div className="dashboard-menu-button home-icon" onClick={() => this.openAssetsDialog()}>
						<HomeIcon />
					</div>
					<div className="dashboard-menu-button home-icon" onClick={() => this.openLoansDialog()}>
						<BankIcon />
					</div>
				</div>

				<NotificationBar
					showNotifications = {this.state.showNotificationBar}
					notifications = {this.props.notifications}
				/>

				<BankDialog 
					showDialog = {this.state.showBankDialog}
					hideDialogCallback = {() => this.hideBankDialog()}
					accounts = {this.props.accounts}
					refreshAccountData = {() => this.props.refreshAccountData()}
				/>

				<SharesDialog
					showDialog = {this.state.showSharesDialog}
					hideDialogCallback = {() => this.hideSharesDialog()}
					shares = {this.props.shares}
					refreshShareData = {() => this.props.refreshShareData()}					
				/>

				<AssetsDialog
					showDialog = {this.state.showAssetsDialog}
					hideDialogCallback = {() => this.hideAssetsDialog()}
					assets = {this.props.assets}
					refreshAssetData = {() => this.props.refreshAssetData()}						
				/>

				<LoansDialog
					showDialog = {this.state.showLoansDialog}
					hideDialogCallback = {() => this.hideLoansDialog()}
					loans = {this.props.loans}
					refreshLoanData = {() => this.props.refreshLoanData()}
				/>
			</div>
		);
	}
}
