import React from 'react';

//Interfaces
import { IAccount } from '../../interfaces/IAccount';

//Components
import { BankCard } from './Cards/BankCard';

//3rd Party Components
import SimpleBar from 'simplebar-react';

interface IProps {
	showDialog: boolean;
	hideDialog: () => void;
	nextDialog: () => void;
	refreshData: () => void;
	accounts: Array<IAccount>;
}

export class BankSummaryDialog extends React.Component<IProps> {

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog fadeIn' : 'dashboard-menu-dialog fadeOut'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-dialog bank">
					<div className="dashboard-dialog-header">
						Bank Accounts
					</div>
					<SimpleBar className="dashboard-dialog-container">
						<div className="dashboard-summary-dialog">
							{this.props.accounts.map(account => (
								<BankCard
									account = {account}
									refreshData = {() => this.props.refreshData()}
								/>
							))}
							<div className={this.props.accounts.length === 0 ? 'dashboard-summary-dialog fadeIn' : 'dashboard-summary-dialog fadeOut'}>
								<p>You do not have any bank accounts</p>	
							</div>
						</div>
					</SimpleBar>
					<div className='dashboard-dialog-neutral-button bank-dialog-left-button' onClick={() => this.props.hideDialog()}>
						Back
					</div>
					<div className='dashboard-dialog-green-button bank-dialog-right-button' onClick={() => this.props.nextDialog()}>
						Add Account
					</div>
				</div>
			</div>
		)
	}
}