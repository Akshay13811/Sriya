import React from 'react';

//Interfaces
import { IShare } from '../../interfaces/IShare';

//Components
import { ShareSummaryDialog } from './ShareSummaryDialog';

interface IProps {
	showDialog: boolean;
	shares: Array<IShare>;
	hideDialogCallback: () => void;
	refreshShareData: () => void;
}

interface IState {
	showSummary: boolean;
	showNewShareForm: boolean;
}

export class SharesDialog extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showSummary: true,
			showNewShareForm: false
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	showSummaryDialog(refreshData: boolean) {
		if(refreshData) {
			this.props.refreshShareData();
		}

		this.setState({
			showSummary: true,
			showNewShareForm: false
		})	
	}

	showShareFormDialog() {
		this.setState({
			showSummary: false,
			showNewShareForm: true
		})		
	}

	closeDialogs() {
		this.setState({
			showSummary: true,
			showNewShareForm: false
		})
		this.props.hideDialogCallback();
	}

	showDialog() {
		return this.state.showSummary || this.state.showNewShareForm;
	}
	
	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialogs fadeIn' : 'dashboard-menu-dialogs fadeOut'} onClick={() => this.closeDialogs()}>
				<div className='dashboard-menu-dialog fadeIn' onClick={(e) => this.dialogClick(e)}>
					<ShareSummaryDialog 
						showDialog = {this.state.showSummary}
						hideDialog = {() => this.props.hideDialogCallback()}
						nextDialog = {() => this.showShareFormDialog()}
						refreshData = {() => this.props.refreshShareData()}
						shares = {this.props.shares}				
					/>
				</div>
			</div>
		)
	}
}