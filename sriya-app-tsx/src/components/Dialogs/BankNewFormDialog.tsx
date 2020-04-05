import React from 'react';

//Constants
import {EndpointUrl} from '../../Configuration';

//Enum
import {BankName} from './BankDialog';

interface IProps {
	showDialog: boolean;
	backDialog: () => void;
	nextDialog: (refreshData: boolean) => void;
	bankOption: BankName;
}

interface IState {
	accountName: string; 
	accountBalance: number;
	accountFile: any;
	displayMsg: string;
}

export class BankNewFormDialog extends React.Component<IProps, IState> {
	
	constructor(props: IProps) {
		super(props);
		this.state = {
			accountName: "",
			accountBalance: -1,
			accountFile: null,
			displayMsg: ""
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	createAccount() {
		if(this.state.accountName == "" || this.state.accountFile == null) {
			alert("Please specify account name and/or file");
			return;
		}
				  
		const formData = new FormData();
		formData.append("importFile", this.state.accountFile);
		formData.append("bankName", this.props.bankOption);
		formData.append("accountName", this.state.accountName);

		if(this.state.accountBalance != -1) {
			formData.append("accountBalance", this.state.accountBalance.toString());
		}

		fetch(EndpointUrl + '/accounts', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			if(data.errmsg && data.errmsg.startsWith("E11000 duplicate key error collection")) {
				this.setState({
					displayMsg: "Account name " + data.keyValue.accountName + " already exists"
				});
			}
			else if(data._id) {
				this.props.nextDialog(true);
			}
		})
	}
	
	accountNameHandler(e: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			accountName: e.currentTarget.value
		});
	}

	accountBalanceHandler(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.value == "") {
			this.setState({
				accountBalance: -1
			});
		}
		else
		{
			var balance = parseFloat(e.currentTarget.value);

			if(isNaN(balance)) {
				this.setState({
					displayMsg: "Invalid account balance"
				});
			}
			else {
				this.setState({
					displayMsg: "",
					accountBalance: balance
				});
			}
		}
	}

	accountFileHandler(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.files && e.currentTarget.files.length > 0) {
			this.setState({
				accountFile: e.currentTarget.files[0]
			});
		}
	}

	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog fadeIn' : 'dashboard-menu-dialog fadeOut'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-bank-dialog">
					<div className="dashboard-dialog-header">
						Bank Accounts
					</div>
					<div className="dashboard-dialog-container">
						<div className='dashboard-bank-form-input'>
							<label>Account Name</label>
							<input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.accountNameHandler(e)}/>
							<label>Account Balance</label>
							<input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.accountBalanceHandler(e)}/>
							<label>Import Bank File</label>
							<input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.accountFileHandler(e)}/>
							<div>{this.state.displayMsg}</div>
						</div>
					</div>
					<div className='dashboard-dialog-neutral-button bank-dialog-left-button' onClick={() => this.props.backDialog()}>
						Back
					</div>
					<div className='dashboard-dialog-green-button bank-dialog-right-button' onClick={() => this.createAccount()}>
						Submit
					</div>
				</div>
			</div>
		)
	}
}
