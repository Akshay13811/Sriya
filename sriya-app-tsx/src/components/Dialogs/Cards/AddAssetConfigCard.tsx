import React from 'react';

//3rd Party Components
import DatePicker from "react-datepicker";
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

	name: string;
	description: string;
	valuation: {date: number, value: number};
}

export class AddAssetConfigCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showAddButton: true,
			showForm: false,
			
			name: "",
			description: "",
			valuation: {value: 0, date: new Date().getTime()}
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
	
	handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			name: e.target.value
		})
	}

	handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			description: e.target.value
		})
	}

	handleValuationDateChange = (date: Date | null) => {
		if(!date) {
			return;
		}

		let valuation = this.state.valuation;
		valuation.date = date.getTime();

		this.setState({
			valuation: valuation
		})
	}

	handleValuationValueChange = (e: React.FormEvent<HTMLInputElement>) => {
		let value: number = parseFloat(e.currentTarget.value.replace(/(\$|,)/g, ''));
		
		let valuation = this.state.valuation;
		valuation.value = Math.round(value * 100);

		this.setState({
			valuation: valuation
		})
	}



	handleDeleteShare = () => {
		
	}

	handleAddShare = () => {
		if(this.state.name === "") {
			alert("Name is invalid");
			return;
		}
		else if(this.state.description === "") {
			alert("Description is invalid");
			return;
		}

		const formData = new FormData();
		formData.append("name", this.state.name);
		formData.append("description", this.state.description);
		let valuations = [];
		valuations.push(this.state.valuation);
		formData.append("valuations", JSON.stringify(valuations));

		fetch(EndpointUrl + '/assets', {
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
			name: "",
			description: "",
			valuation: {date: new Date().getTime(), value: 0}
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
					<div className='dashboard-asset-config-card'>
						<input className="dashboard-asset-config-card-item" placeholder="Name" value={this.state.name} onInput={this.handleNameChange}></input>
						<input className="dashboard-asset-config-card-item" placeholder="Description" value={this.state.description} onInput={this.handleDescriptionChange}></input>
						<div className="dashboard-config-card-date">
							<DatePicker
								selected={new Date(this.state.valuation.date)}
								onChange={this.handleValuationDateChange}
								dateFormat="d MMM yyyy"
							/>
						</div>
						<input className="dashboard-asset-config-card-item" placeholder="Value" value={'$' + this.numberWithCommas(this.state.valuation.value / 100)} onInput={(e) => this.handleValuationValueChange(e)}></input>

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