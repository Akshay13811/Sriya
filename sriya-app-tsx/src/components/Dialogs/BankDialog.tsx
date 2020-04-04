import React from 'react';

//Interfaces
import { IAccount } from '../../interfaces/IAccount';

//Components
import { BankSummaryDialog } from './BankSummaryDialog';
import { BankNewSelectionDialog } from './BankNewSelectionDialog';
import { BankNewFormDialog } from './BankNewFormDialog';

export enum BankName {
	UNKNOWN = "",
	ING = "ING",
	UBANK = "UBANK",
	COMMBANK = "COMMBANK"
}

interface IProps {
	showDialog: boolean;
	accounts: Array<IAccount>;
	hideDialogCallback: () => void;
	refreshAccountData: () => void;
}

interface IState {
	showSummary: boolean;
	showNewBankSelection: boolean;
	showNewBankForm: boolean;
	bankOption: BankName;
}

export class BankDialog extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showSummary: true,
			showNewBankSelection: false,
			showNewBankForm: false,
			bankOption: BankName.UNKNOWN
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	showSummaryDialog(refreshData: boolean) {
		if(refreshData) {
			this.props.refreshAccountData();
		}

		this.setState({
			showSummary: true,
			showNewBankSelection: false,
			showNewBankForm: false
		})	
	}

	showBankSelectionDialog() {
		this.setState({
			showSummary: false,
			showNewBankSelection: true,
			showNewBankForm: false
		})		
	}

	showBankFormDialog(bankOption: BankName) {
		this.setState({
			showSummary: false,
			showNewBankSelection: false,
			showNewBankForm: true,
			bankOption: bankOption
		});
	}

	closeDialogs() {
		this.setState({
			showSummary: true,
			showNewBankSelection: false,
			showNewBankForm: false,
		})
		this.props.hideDialogCallback();
	}

	showDialog() {
		return this.state.showSummary || this.state.showNewBankSelection || this.state.showNewBankForm;
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialogs fadeIn' : 'dashboard-menu-dialogs fadeOut'} onClick={() => this.closeDialogs()}>
				<div className='dashboard-menu-dialog fadeIn' onClick={(e) => this.dialogClick(e)}>
					<BankSummaryDialog 
						showDialog = {this.state.showSummary}
						hideDialog = {() => this.props.hideDialogCallback()}
						nextDialog = {() => this.showBankSelectionDialog()}
						refreshData = {() => this.props.refreshAccountData()}
						accounts = {this.props.accounts}				
					/>
					<BankNewSelectionDialog
						showDialog = {this.state.showNewBankSelection}
						backDialog = {(i) => this.showSummaryDialog(i)}
						nextDialog = {(i) => this.showBankFormDialog(i)}
					/>
					<BankNewFormDialog
						showDialog = {this.state.showNewBankForm}
						backDialog = {() => this.showBankSelectionDialog()}
						nextDialog = {(i) => this.showSummaryDialog(i)}
						bankOption = {this.state.bankOption}
					/>
				</div>
			</div>
		)
	}
}