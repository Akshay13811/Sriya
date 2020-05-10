import React from 'react';

//Interfaces
import { ILoan } from '../../interfaces/ILoan';

//Components
import { LoanConfigCard } from './Cards/LoanConfigCard';
import { AddLoanConfigCard } from './Cards/AddLoanConfigCard';

//3rd Party Components
import SimpleBar from 'simplebar-react';

interface IProps {
	showDialog: boolean;
	hideDialog: () => void;
	nextDialog: () => void;
	refreshData: () => void;
	loans: Array<ILoan>;
}

export class LoanSummaryDialog extends React.Component<IProps> {

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog fadeIn' : 'dashboard-menu-dialog fadeOut'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-dialog">
					<div className="dashboard-dialog-header">
						Loans
					</div>
					<SimpleBar className="dashboard-dialog-container">
						<div className="dashboard-summary-dialog">
							<div className="dashboard-loan-summary-dialog-table-header">
								<div className="dashboard-summary-table-header-column">
									Account Name
								</div>
								<div className="dashboard-summary-table-header-column">
									Bank
								</div>
								<div className="dashboard-summary-table-header-column">
									Amount
								</div>
								<div className="dashboard-summary-table-header-column">
								</div>
								<div className="dashboard-summary-table-header-column">
								</div>
							</div>
							{this.props.loans.map(loan => (
								<LoanConfigCard
									loan = {loan}
									refreshData = {() => this.props.refreshData()}
								/>
							))}
							<AddLoanConfigCard
								refreshData = {() => this.props.refreshData()}
							/>
							<div className={this.props.loans.length === 0 ? 'dashboard-summary-dialog fadeIn' : 'dashboard-summary-dialog fadeOut'}>
								<p>You do not have any loans</p>	
							</div>
						</div>
					</SimpleBar>
				</div>
			</div>
		)
	}
}