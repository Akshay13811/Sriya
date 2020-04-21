import React from 'react';

//3rd Party Components
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//Images
import {ReactComponent as AddIcon} from '../../../images/add.svg';
import {ReactComponent as TickIcon} from '../../../images/tick.svg';
import {ReactComponent as CrossIcon} from '../../../images/cross.svg';

//Interfaces
import {IShare} from '../../../interfaces/IShare';

//Constants
import {EndpointUrl} from '../../../Configuration';

interface IProps {
	refreshData: () => void;
}

interface IState {
	showAddButton: boolean;
	showForm: boolean;
	purchaseDate: Date;
	index: string;
	code: string;
	units: number;
	price: number;
	soldDate: Date | null;
	isSold: boolean;
}

export class AddShareConfigCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showAddButton: true,
			showForm: false,
			purchaseDate: new Date(),
			index: "ASX",
			code: "",
			units: 0,
			price: 0,
			isSold: false,
			soldDate: new Date()
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
		
	}

	handleAddShare = () => {
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

		fetch(EndpointUrl + '/shares', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			console.log(data);
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
			purchaseDate: new Date(),
			index: "ASX",
			code: "",
			units: 0,
			price: 0,
			isSold: false,
			soldDate: new Date()
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
					<div className='dashboard-add-share-config-card'>
						<div contentEditable={true} placeholder="Index" onInput={this.handleIndexChange}>ASX</div>
						<div contentEditable={true} placeholder="Code" onInput={this.handleCodeChange}></div>
						<div className="dashboard-share-purchase-date">
							<DatePicker
								selected={this.state.purchaseDate}
								onChange={this.handlePurchaseChange}
								dateFormat="d MMM yyyy"
							/>
						</div>
						<div className="dashboard-share-sold-date">
							<input type="checkbox" checked={this.state.isSold} onClick={this.handleIsSold}></input>
							{this.state.isSold &&
								<DatePicker
								selected={this.state.soldDate}
								onChange={this.handleSoldChange}
								dateFormat="d MMM yyyy"
								/>
							}
						</div>			
						<div contentEditable={true} placeholder="Units" id="add-share-units" onInput={this.handleUnitsChange}/>
						<div contentEditable={true} placeholder="Price" id="add-share-price"  onInput={this.handlePriceChange}/>
						<div className="dashboard-share-config-card-tick-icon" onClick={this.handleAddShare}>
							<TickIcon />
						</div>
						<div className="dashboard-share-config-card-cross-icon" onClick={this.cancelFormDialog}>
							<CrossIcon />
						</div>
					</div>
				}
			</div>
		)
	}
}