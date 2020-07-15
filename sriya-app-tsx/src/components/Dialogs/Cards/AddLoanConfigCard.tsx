import React from 'react';

//3rd Party Components
import "react-datepicker/dist/react-datepicker.css";

//Images
import {ReactComponent as AddIcon} from '../../../images/add.svg';
import {ReactComponent as TickIcon} from '../../../images/tick.svg';
import {ReactComponent as CrossIcon} from '../../../images/cross.svg';

//Constants
import {EndpointUrl} from '../../../Configuration';

interface IProps {
	refreshData: () => void;
}

interface IState {
	showAddButton: boolean;
	showForm: boolean;

	accountName: string;
	bankName: string;
	accountFile: any;
	loanAmount: number;
	interestRate: string;
}

export class AddLoanConfigCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showAddButton: true,
			showForm: false,
			
			accountName: "",
			bankName: "",
			accountFile: null,
			loanAmount: 0,
			interestRate: "0"
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

	handleAddShare = () => {
		if(this.state.accountName === "") {
			alert("Name is invalid");
			return;
		}
		else if(this.state.bankName === "") {
			alert("Description is invalid");
			return;
		}
		else if(this.state.loanAmount === 0) {
			alert("Loan amount is invalid");
			return;
		}
		else if(this.state.interestRate === "") {
			alert("Interest rate is invalid");
			return;
		}

		const formData = new FormData();
		formData.append("accountName", this.state.accountName);
		formData.append("bankName", this.state.bankName);
		formData.append("loanAmount", this.state.loanAmount.toString());
		formData.append("interestRate", this.state.interestRate.toString());
		formData.append("importFile", this.state.accountFile);

		fetch(EndpointUrl + '/loans', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			this.props.refreshData();
		})

		this.cancelFormDialog();
	}

	showFormDialog = () => {
		this.setState({
			showAddButton: false,
			showForm: true
		})		
	}

	cancelFormDialog = () => {
		this.setState({
			showAddButton: true,
			showForm: false
		})		

		this.setState({
			accountName: "",
			bankName: "",
			accountFile: null,
			loanAmount: 0,
			interestRate: "0"
		})
	}

	render() {
		return (
			<div>
				{this.state.showAddButton && 
					<div className='dashboard-add-share' onClick={this.showFormDialog}>
							<AddIcon />
					</div>
				}
				{this.state.showForm &&
					<div className='dashboard-loan-config-card'>
						<input className="dashboard-loan-config-card-item" placeholder="Account Name" value={this.state.accountName} onInput={this.handleAccountNameChange}></input>
						<input className="dashboard-loan-config-card-item" placeholder="Bank Name" value={this.state.bankName} onInput={this.handleBankNameChange}></input>
						<input className="dashboard-loan-config-card-item" placeholder="Value" value={'$' + this.numberWithCommas(this.state.loanAmount / 100)} onInput={this.handleLoanAmountChange}></input>
						<input className="dashboard-loan-config-card-item" placeholder="Interest Rate" value={this.state.interestRate + '%'} onInput={this.handleInterestRateChange}></input>

						<div className="dashboard-share-config-card-tick-icon" onClick={this.handleAddShare}>
							<TickIcon />
						</div>
						<div className="dashboard-share-config-card-cross-icon" onClick={this.cancelFormDialog}>
							<CrossIcon />
						</div>

						<div className="dashboard-loan-config-file-upload">
							<input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.accountFileHandler(e)}/>
						</div>
					</div>
				}
			</div>
		)
	}
}