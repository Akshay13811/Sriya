import React from 'react';

//3rd Party Components
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//Images
import {ReactComponent as TickIcon} from '../../../images/tick.svg';
import {ReactComponent as CrossIcon} from '../../../images/cross.svg';
import {ReactComponent as EditIcon} from '../../../images/edit.svg';
import {ReactComponent as DeleteIcon} from '../../../images/delete.svg';

//Interfaces
import {IShare} from '../../../interfaces/IShare';

//Constants
import {EndpointUrl} from '../../../Configuration';

interface IProps {
	share: IShare;
	refreshData: () => void;
}

interface IState {
	editMode: boolean;

	index: string;
	code: string;
	units: number;
	price: number;
	isSold: boolean;
	soldDate: Date | null;
	purchaseDate: Date;
}

export class ShareConfigCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			editMode: false,

			index: this.props.share.index,
			code: this.props.share.code,
			units: this.props.share.numberOfShares,
			price: this.props.share.purchasePrice,
			isSold: this.props.share.soldDate ? true : false,
			soldDate: this.props.share.soldDate ? new Date(this.props.share.soldDate) : null,
			purchaseDate: new Date(this.props.share.purchaseDate)
		}
	}

	dialogClick(e: React.MouseEvent) {
		e.stopPropagation();
	}

	handlePurchaseChange = (date: Date) => {
		date.setHours(0,0,0,0);
		this.setState({
			purchaseDate: date
		});
	};

	handleSoldChange = (date: Date) => {
		date.setHours(0,0,0,0);
		this.setState({
			soldDate: date
		});
	};

	handleIsSold = () => {
		this.setState({
			isSold: !this.state.isSold
		})
	}

	handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			index: e.currentTarget.innerHTML
		})
	}

	handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			code: e.currentTarget.innerHTML
		})
	}

	handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			units: parseInt(e.currentTarget.innerHTML)
		})
	}

	handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			price: parseFloat(e.currentTarget.innerHTML)
		})
	}

	handleDeleteShare = () => {
		fetch(EndpointUrl + '/shares/' + this.props.share._id, {
			method: 'DELETE',
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
			}
		})
	}

	toggleEditMode = () => {
		this.setState({
			editMode: !this.state.editMode
		})
	}

	handleUpdateShare = () => {
		if(this.state.index == "") {
			alert("Index is invalid");
			return;
		}
		else if(this.state.code == "") {
			alert("Code is invalid");
			return;
		}
		else if(!this.state.purchaseDate) {
			alert("Purchase date is invalid");
			return;
		}
		else if(this.state.isSold && !this.state.soldDate) {
			alert("Sold date is invalid");
			return;
		}
		else if(isNaN(this.state.units) || this.state.units == 0) {
			alert("Available units is invalid");
			return;
		}
		else if(isNaN(this.state.price) || this.state.price == 0) {
			alert("Purchase price is invalid")
			return;
		}

		const formData = new FormData();
		formData.append("index", this.state.index);
		formData.append("code", this.state.code);
		formData.append("purchaseDate", this.state.purchaseDate.getTime().toString());
		if(this.state.isSold && this.state.soldDate) {
			formData.append("soldDate", this.state.soldDate.getTime().toString());
		}
		formData.append("numberOfShares", this.state.units.toString());
		formData.append("purchasePrice", this.state.price.toString());

		fetch(EndpointUrl + '/shares/' + this.props.share._id, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			console.log(data);
			if(data.success) {
				this.props.refreshData();
			}
			else {
				//Revert states back to the prop values
				console.log("reverting values");
				this.setState({
					index: this.props.share.index,
					code: this.props.share.code,
					units: this.props.share.numberOfShares,
					price: this.props.share.purchasePrice,
					isSold: this.props.share.soldDate ? true : false,
					soldDate: this.props.share.soldDate ? new Date(this.props.share.soldDate) : null,
					purchaseDate: new Date(this.props.share.purchaseDate)
				})
			}
		})

		this.setState({
			editMode: false
		})
	}

	render() {
		return (
			<div className="dashboard-share-config-card">
				<div contentEditable={this.state.editMode} className="dashboard-share-config-card-item" onInput={this.handleIndexChange}>{this.state.index}</div>
				<div contentEditable={this.state.editMode} className="dashboard-share-config-card-item" onInput={this.handleCodeChange}>{this.state.code}</div>
				<div className="dashboard-share-purchase-date">
					<DatePicker
						selected={this.state.purchaseDate}
						onChange={this.handlePurchaseChange}
						dateFormat="d MMM yyyy"
					/>
				</div>
				<div className="dashboard-share-sold-date">
					<input disabled={!this.state.editMode} defaultChecked={this.state.isSold} onClick={this.handleIsSold} type="checkbox"></input>
					{this.state.isSold &&
						<DatePicker
						selected={this.state.soldDate}
						onChange={this.handleSoldChange}
						dateFormat="d MMM yyyy"
						/>
					}	
				</div>					
				<div contentEditable={this.state.editMode} className="dashboard-share-config-card-item" onInput={this.handleUnitsChange}>{this.state.editMode && this.props.share.numberOfShares}{!this.state.editMode && this.state.units}</div>
				<div contentEditable={this.state.editMode} className="dashboard-share-config-card-item" onInput={this.handlePriceChange}>${this.state.price.toFixed(2)}</div>
				{!this.state.editMode && 
					<div className="dashboard-share-config-card-edit-icon" onClick={this.toggleEditMode}>
						<EditIcon />
					</div>
				}
				{this.state.editMode &&
					<div className="dashboard-share-config-card-tick-icon" onClick={this.handleUpdateShare}>
						<TickIcon />
					</div>
				}
				{!this.state.editMode && 
					<div className="dashboard-share-config-card-delete-icon" onClick={this.handleDeleteShare}>
						<DeleteIcon />
					</div>
				}
				{this.state.editMode &&
					<div className="dashboard-share-config-card-cross-icon" onClick={this.toggleEditMode}>
						<CrossIcon />
					</div>
				}
			</div>
		)
	}
}