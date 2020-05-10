import React from 'react';

//Interfaces
import { IAsset } from '../../interfaces/IAsset';

//Components
import { AssetConfigCard } from './Cards/AssetConfigCard';
import { AddAssetConfigCard } from './Cards/AddAssetConfigCard';

//3rd Party Components
import SimpleBar from 'simplebar-react';

interface IProps {
	showDialog: boolean;
	hideDialog: () => void;
	nextDialog: () => void;
	refreshData: () => void;
	assets: Array<IAsset>;
}

export class AssetSummaryDialog extends React.Component<IProps> {

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog fadeIn' : 'dashboard-menu-dialog fadeOut'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-dialog">
					<div className="dashboard-dialog-header">
						Assets
					</div>
					<SimpleBar className="dashboard-dialog-container">
						<div className="dashboard-summary-dialog">
							<div className="dashboard-asset-summary-dialog-table-header">
								<div className="dashboard-summary-table-header-column">
									Name
								</div>
								<div className="dashboard-summary-table-header-column">
									Description
								</div>
								<div className="dashboard-summary-table-header-column">
									Valuations
								</div>
								<div className="dashboard-summary-table-header-column">
								</div>
								<div className="dashboard-summary-table-header-column">
								</div>	
								<div className="dashboard-summary-table-header-column">
								</div>	
								<div className="dashboard-summary-table-header-column">
								</div>	
							</div>
							{this.props.assets.map(asset => (
								<AssetConfigCard
									asset = {asset}
									refreshData = {() => this.props.refreshData()}
								/>
							))}
							<AddAssetConfigCard
								refreshData = {() => this.props.refreshData()}
							/>
							<div className={this.props.assets.length === 0 ? 'dashboard-summary-dialog fadeIn' : 'dashboard-summary-dialog fadeOut'}>
								<p>You do not have any assets</p>	
							</div>
						</div>
					</SimpleBar>
				</div>
			</div>
		)
	}
}