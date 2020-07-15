import React from 'react';

//3rd Party Components
import "react-datepicker/dist/react-datepicker.css";

//Images
import {ReactComponent as TickIcon} from '../../../images/tick.svg';
import {ReactComponent as CrossIcon} from '../../../images/cross.svg';
import {ReactComponent as EditIcon} from '../../../images/edit.svg';
import {ReactComponent as DeleteIcon} from '../../../images/delete.svg';

//Interfaces
import {ILoan} from '../../../interfaces/ILoan';

//Constants
import {EndpointUrl} from '../../../Configuration';

interface IProps {
	loan: ILoan;
	refreshData: () => void;
}

interface IState {
	editMode: boolean;

	accountName: string;
	bankName: string;
	accountFile: any;
	loanAmount: number;
	interestRate: string;
}

export class LoanConfigCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			editMode: false,

			accountName: this.props.loan.accountName,
			bankName: this.props.loan.bankName,
			accountFile: null,
			loanAmount: this.props.loan.loanAmount,
			interestRate: this.props.loan.interestRate
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	numberWithCommas(x: number) {
		if(!x) {
			return "0"
		}
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			accountName: e.target.value
		})
	}

	handleBankNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			bankName: e.target.value
		})
	}

	handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value: number = parseFloat(e.currentTarget.value.replace(/(\$|,)/g, ''));
		let loanAmount = Math.round(value * 100);

		this.setState({
			loanAmount: loanAmount
		})
	}

	handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			interestRate: e.currentTarget.value.replace(/(\%|,)/g, '')
		})
	}

	accountFileHandler(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.files && e.currentTarget.files.length > 0) {
			this.setState({
				accountFile: e.currentTarget.files[0]
			});
		}
	}

	handleDeleteLoan = () => {
		fetch(EndpointUrl + '/loans/' + this.props.loan._id, {
			method: 'DELETE',
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
			}
		})
	}

	cancelMode = () => {
		this.setState({
			editMode: false,
			accountName: this.props.loan.accountName,
			bankName: this.props.loan.bankName,
			loanAmount: this.props.loan.loanAmount
		})
	}

	update = () => {
		if(this.state.editMode) {
			this.handleUpdateLoan();
		}
		
		this.setState({
			editMode: false
		})
	}

	delete = () => {
		this.handleDeleteLoan();
	}

	modifyMode = () => {
		this.setState({
			editMode: true
		})
	}

	handleUpdateLoan = () => {
		if(this.state.accountName === "") {
			alert("Account Name is invalid");
			return;
		}
		else if(this.state.bankName === "") {
			alert("Bank Name is invalid");
			return;
		}

		const formData = new FormData();
		formData.append("accountName", this.state.accountName);
		formData.append("bankName", this.state.bankName);
		formData.append("loanAmount", this.state.loanAmount.toString());
		formData.append("interestRate", this.state.interestRate);
		formData.append("importFile", this.state.accountFile);

		fetch(EndpointUrl + '/loans/' + this.props.loan._id, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
			}
			else {
				//Revert states back to the prop values
				this.setState({
					accountName: this.props.loan.accountName,
					bankName: this.props.loan.bankName,
					loanAmount: this.props.loan.loanAmount,
				})
			}
		})
	}

	render() {	
		return (
			<div className="dashboard-loan-config-card">
				<input className="dashboard-loan-config-card-item" disabled={!this.state.editMode} value={this.state.accountName} onInput={this.handleAccountNameChange}></input>
				<input className="dashboard-loan-config-card-item" disabled={!this.state.editMode} value={this.state.bankName} onInput={this.handleBankNameChange}></input>
				<input className="dashboard-loan-config-card-item" disabled={!this.state.editMode} value={'$' + this.numberWithCommas(this.state.loanAmount / 100)} onInput={this.handleLoanAmountChange}></input>
				<input className="dashboard-loan-config-card-item" disabled={!this.state.editMode} value={this.state.interestRate + '%'} onInput={this.handleInterestRateChange}></input>

				{(!this.state.editMode) &&
					<div className="dashboard-share-config-card-edit-icon" onClick={this.modifyMode}>
						<EditIcon />
					</div>
				}
				{(this.state.editMode) &&
					<div className="dashboard-share-config-card-tick-icon" onClick={this.update}>
						<TickIcon />
					</div>
				}			
				{(this.state.editMode) &&
					<div className="dashboard-share-config-card-cross-icon" onClick={this.cancelMode}>
						<CrossIcon />
					</div>
				}
				{(!this.state.editMode) &&
					<div className="dashboard-share-config-card-delete-icon" onClick={this.delete}>
						<DeleteIcon />
					</div>	
				}
				{(this.state.editMode) &&
					<div className="dashboard-loan-config-file-upload">
						<input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.accountFileHandler(e)}/>
					</div>
				}
			</div>
		)
	}
}