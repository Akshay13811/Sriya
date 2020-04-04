import React from 'react';

//Interfaces
import {IAccount} from '../../interfaces/IAccount';

//Constants
import {EndpointUrl} from '../../Configuration';

interface IProps {
	account: IAccount;
	refreshData: () => void;
}

interface IState {
	expanded: boolean;
	showUpdate: boolean;
	message: string;
	accountFile: any;
	accountFileName: string;
}

export class BankCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			expanded: false,
			showUpdate: false,
			message: "",
			accountFile: null,
			accountFileName: ""
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	toggleExpand() {
		this.setState({
			expanded: !this.state.expanded
		})
	}

	deleteAccount() {
		fetch(EndpointUrl + '/accounts/' + this.props.account._id, {
			method: 'DELETE',
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
			}
		})
	}

	updateAccount() {
		if(!this.state.accountFile) {
			alert("Please specify account file");
			return;
		}
		const formData = new FormData();
		formData.append("importFile", this.state.accountFile);
		fetch(EndpointUrl + '/accounts/' + this.props.account._id, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			if(data._id) {
				this.props.refreshData();
				this.hideUpdate();
				this.setState({
					accountFile: null,
				})
			}
		})
	}

	showUpdate() {
		this.setState({
			expanded: false,
			showUpdate: true
		})
	}

	hideUpdate() {
		this.setState({
			expanded: false,
			showUpdate: false,
			accountFile: null,
			accountFileName: ""
		})
	}

	accountFileHandler(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.files && e.currentTarget.files.length > 0) {
			this.setState({
				accountFile: e.currentTarget.files[0],
				accountFileName: e.currentTarget.value
			});
		}
	}

	render() {
		return (
			<div className="dashboard-bank-card" onClick={() => this.toggleExpand()}>
				<div className="dashboard-bank-card-name">
					{this.props.account.accountName}
				</div>
				<div className="dashboard-bank-card-amount">
					${this.numberWithCommas(this.props.account.currentBalance)}
				</div>
				<div className={this.state.expanded && !this.state.showUpdate ? 'dashboard-bank-card-expand fadeIn' : 'dashboard-bank-card-expand fadeOut'} onClick={() => this.showUpdate()}>
					<div className='dashboard-dialog-neutral-button bank-dialog-left-button'>
						Update
					</div>
					<div className='dashboard-dialog-red-button bank-dialog-right-button' onClick={() => this.deleteAccount()}>
						Delete
					</div>
				</div>
				<div className={this.state.showUpdate ? 'dashboard-bank-card-update fadeIn' : 'dashboard-bank-card-update fadeOut'} onClick={(e) => this.dialogClick(e)}>
					<label className='dashboard-bank-card-label'>Import Bank File</label>
					<input value={this.state.accountFileName} className='dashboard-bank-card-update-input' type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.accountFileHandler(e)}/>
					<div className='dashboard-dialog-red-button bank-dialog-left-button' onClick={() => this.hideUpdate()}>
						Cancel
					</div>
					<div className='dashboard-dialog-green-button bank-dialog-right-button' onClick={() => this.updateAccount()}>
						Update
					</div>
				</div>
			</div>
		)
	}
}