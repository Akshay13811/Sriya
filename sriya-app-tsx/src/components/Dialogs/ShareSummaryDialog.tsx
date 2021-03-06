import React from 'react';

//Interfaces
import { IShare } from '../../interfaces/IShare';

//Components
import { ShareConfigCard } from './Cards/ShareConfigCard';
import { AddShareConfigCard } from './Cards/AddShareConfigCard';

//3rd Party Components
import SimpleBar from 'simplebar-react';

interface IProps {
	showDialog: boolean;
	hideDialog: () => void;
	nextDialog: () => void;
	refreshData: () => void;
	shares: Array<IShare>;
}

export class ShareSummaryDialog extends React.Component<IProps> {

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog fadeIn' : 'dashboard-menu-dialog fadeOut'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-dialog">
					<div className="dashboard-dialog-header">
						Shares
					</div>
					<SimpleBar className="dashboard-dialog-container">
						<div className="dashboard-summary-dialog">
							<div className="dashboard-share-summary-dialog-table-header">
								<div className="dashboard-summary-table-header-column">
									Index
								</div>
								<div className="dashboard-summary-table-header-column">
									Code
								</div>
								<div className="dashboard-summary-table-header-column">
									Purchase Date
								</div>
								<div className="dashboard-summary-table-header-column">
									Sold Date
								</div>
								<div className="dashboard-summary-table-header-column">
									Available Units
								</div>
								<div className="dashboard-summary-table-header-column">
									Purchase Price
								</div>
								<div className="dashboard-summary-table-header-column">
								</div>	
								<div className="dashboard-summary-table-header-column">
								</div>	
							</div>
							{this.props.shares.map(share => (
								<ShareConfigCard
									share = {share}
									refreshData = {() => this.props.refreshData()}
								/>
							))}
							<AddShareConfigCard
								refreshData = {() => this.props.refreshData()}
							/>
							<div className={this.props.shares.length === 0 ? 'dashboard-summary-dialog fadeIn' : 'dashboard-summary-dialog fadeOut'}>
								<p>You do not have any share accounts</p>	
							</div>
						</div>
					</SimpleBar>
				</div>
			</div>
		)
	}
}