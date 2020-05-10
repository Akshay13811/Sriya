import React from 'react';

//Interfaces
import { ILoan } from '../../interfaces/ILoan';

//Components
import { LoanSummaryDialog } from './LoanSummaryDialog';

interface IProps {
	showDialog: boolean;
	loans: Array<ILoan>;
	hideDialogCallback: () => void;
	refreshLoanData: () => void;
}

interface IState {
	showSummary: boolean;
	showNewLoanForm: boolean;
}

export class LoansDialog extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showSummary: true,
			showNewLoanForm: false
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	showSummaryDialog(refreshData: boolean) {
		if(refreshData) {
			this.props.refreshLoanData();
		}

		this.setState({
			showSummary: true,
			showNewLoanForm: false
		})	
	}

	showLoanFormDialog() {
		this.setState({
			showSummary: false,
			showNewLoanForm: true
		})		
	}

	closeDialogs() {
		this.setState({
			showSummary: true,
			showNewLoanForm: false
		})
		this.props.hideDialogCallback();
	}

	showDialog() {
		return this.state.showSummary || this.state.showNewLoanForm;
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialogs fadeIn' : 'dashboard-menu-dialogs fadeOut'} onClick={() => this.closeDialogs()}>
				<div className='dashboard-menu-dialog fadeIn' onClick={(e) => this.dialogClick(e)}>
					<LoanSummaryDialog 
						showDialog = {this.state.showSummary}
						hideDialog = {() => this.props.hideDialogCallback()}
						nextDialog = {() => this.showLoanFormDialog()}
						refreshData = {() => this.props.refreshLoanData()}
						loans = {this.props.loans}				
					/>
				</div>
			</div>
		)
	}
}