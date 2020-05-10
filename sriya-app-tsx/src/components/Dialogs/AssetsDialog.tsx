import React from 'react';

//Interfaces
import { IAsset } from '../../interfaces/IAsset';

//Components
import { AssetSummaryDialog } from './AssetSummaryDialog';

interface IProps {
	showDialog: boolean;
	assets: Array<IAsset>;
	hideDialogCallback: () => void;
	refreshAssetData: () => void;
}

interface IState {
	showSummary: boolean;
	showNewAssetForm: boolean;
}

export class AssetsDialog extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showSummary: true,
			showNewAssetForm: false
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	showSummaryDialog(refreshData: boolean) {
		if(refreshData) {
			this.props.refreshAssetData();
		}

		this.setState({
			showSummary: true,
			showNewAssetForm: false
		})	
	}

	showAssetFormDialog() {
		this.setState({
			showSummary: false,
			showNewAssetForm: true
		})		
	}

	closeDialogs() {
		this.setState({
			showSummary: true,
			showNewAssetForm: false
		})
		this.props.hideDialogCallback();
	}

	showDialog() {
		return this.state.showSummary || this.state.showNewAssetForm;
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialogs fadeIn' : 'dashboard-menu-dialogs fadeOut'} onClick={() => this.closeDialogs()}>
				<div className='dashboard-menu-dialog fadeIn' onClick={(e) => this.dialogClick(e)}>
					<AssetSummaryDialog 
						showDialog = {this.state.showSummary}
						hideDialog = {() => this.props.hideDialogCallback()}
						nextDialog = {() => this.showAssetFormDialog()}
						refreshData = {() => this.props.refreshAssetData()}
						assets = {this.props.assets}				
					/>
				</div>
			</div>
		)
	}
}