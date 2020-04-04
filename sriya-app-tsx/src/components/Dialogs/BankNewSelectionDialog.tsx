import React from 'react';

//Images
import ingIcon from '../../images/ing.jpg';
import ubankIcon from '../../images/ubank.jpg';
import commbankIcon from '../../images/commbank.png';

//Enums
import {BankName} from './BankDialog';

interface IProps {
	showDialog: boolean;
	backDialog: (refreshData: boolean) => void;
	nextDialog: (bankOption: BankName) => void;
}

export class BankNewSelectionDialog extends React.Component<IProps> {
	
	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	render() {
		return (
			<div className={this.props.showDialog ? 'dashboard-menu-dialog fadeIn' : 'dashboard-menu-dialog fadeOut'} onClick={(e) => this.dialogClick(e)}>
				<div className="dashboard-bank-dialog">
					<div className="dashboard-dialog-header">
						Bank Accounts
					</div>
					<div className="dashboard-dialog-container">
						<div className='dashboard-bank-form-bank-list'>
							<div className="dashboard-bank-form-bank-option" onClick={() => this.props.nextDialog(BankName.ING)}>
								<img src={ingIcon}></img>
							</div>
							<div className="dashboard-bank-form-bank-option" onClick={() => this.props.nextDialog(BankName.UBANK)}>
								<img src={ubankIcon}></img>
							</div>
							<div className="dashboard-bank-form-bank-option" onClick={() => this.props.nextDialog(BankName.COMMBANK)}>
								<img src={commbankIcon}></img>
							</div>
						</div>
					</div>
					<div className='dashboard-dialog-neutral-button bank-dialog-left-button' onClick={() => this.props.backDialog(false)}>
						Back
					</div>
				</div>
			</div>
		)
	}
}
