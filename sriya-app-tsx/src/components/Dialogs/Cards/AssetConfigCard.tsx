import React from 'react';

//3rd Party Components
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//Images
import {ReactComponent as TickIcon} from '../../../images/tick.svg';
import {ReactComponent as CrossIcon} from '../../../images/cross.svg';
import {ReactComponent as EditIcon} from '../../../images/edit.svg';
import {ReactComponent as DeleteIcon} from '../../../images/delete.svg';
import {ReactComponent as DollarIcon} from '../../../images/dollar.svg';

//Interfaces
import {IAsset} from '../../../interfaces/IAsset';
import {IValuation} from '../../../interfaces/IAsset';

//Constants
import {EndpointUrl} from '../../../Configuration';

interface IProps {
	asset: IAsset;
	refreshData: () => void;
}

interface IState {
	editMode: boolean;
	addMode: boolean;

	name: string;
	description: string;
	valuations: Array<IValuation>;
}

export class AssetConfigCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			editMode: false,
			addMode: false,

			name: this.props.asset.name,
			description: this.props.asset.description,
			valuations: this.props.asset.valuations
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

	handleValuationDateChange = (date: Date | null, id: String) => {
		if(!date) {
			return;
		}

		let valuations: Array<IValuation> = this.state.valuations;

		for(let valuation of valuations) {
			if(valuation._id === id) {
				valuation.date = date.getTime();
			}
		}

		this.setState({
			valuations: valuations
		})
	};

	handleValuationValueChange = (e: React.FormEvent<HTMLInputElement>, id: String) => {
		let valuations: Array<IValuation> = this.state.valuations;
		let value: number = parseFloat(e.currentTarget.value.replace(/(\$|,)/g, ''));
		
		for(let valuation of valuations) {
			if(valuation._id === id) {
				valuation.value = Math.round(value * 100);
			}
		}
		
		this.setState({
			valuations: valuations
		})
	}

	handleCurrentValueChange = (e: React.FormEvent<HTMLInputElement>) => {
		let value: number = parseFloat(e.currentTarget.value.replace(/(\$|,)/g, ''));
		let valautions = this.state.valuations;
		valautions[0].value = Math.round(value * 100);

		this.setState({
			valuations: valautions
		})
	}

	handleCurrentDateChange = (date: Date | null) => {
		if(!date || !this.state.editMode) {
			return;
		}

		let valuations = this.state.valuations;
		valuations[0].date = date.getTime();

		this.setState({
			valuations: valuations
		})
	}

	handleDeleteAsset = () => {
		fetch(EndpointUrl + '/assets/' + this.props.asset._id, {
			method: 'DELETE',
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
			}
		})
	}

	handleDeleteValuation = (id: String) => {

		//Remove valuations from list
		let index: number = 0;
		for(; index<this.state.valuations.length; index++) {
			if(this.state.valuations[index]._id === id) {
				break;
			}
		}

		if(index < this.state.valuations.length) {
			this.state.valuations.splice(index,1);
		}

		this.handleUpdateAsset();
	}

	modifyMode = () => {
		this.setState({
			editMode: true
		})
	}

	cancelMode = () => {
		if(this.state.addMode) {
			this.state.valuations.shift();
		}

		this.setState({
			valuations: this.state.valuations,
			editMode: false,
			addMode: false
		})
	}

	addMode = () => {
		let valuation: IValuation = {_id: "0", date: new Date().getTime(), value: 0};
		this.state.valuations.unshift(valuation);

		this.setState({
			addMode: !this.state.addMode,
			valuations: this.state.valuations
		})
	}

	update = () => {
		if(this.state.editMode) {
			this.handleUpdateAsset();
		}
		if(this.state.addMode) {
			this.handleAddValuation();
		}
		
		this.setState({
			editMode: false,
			addMode: false
		})
	}

	delete = () => {
		if(this.state.editMode) {
			if(this.state.valuations.length === 1) {
				alert("Asset must have at least one valuations");
				return;
			}
			this.handleDeleteValuation(this.state.valuations[0]._id);
		}
		else {
			this.handleDeleteAsset();
		}
	}

	handleAddValuation = () => {
		
		const formData = new FormData();
		formData.append("date", this.state.valuations[0].date.toString());
		formData.append("value", this.state.valuations[0].value.toString());

		fetch(EndpointUrl + '/assets/' + this.props.asset._id + '/valuations', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
				this.setState({
					name: data.asset.name,
					description: data.asset.description,
					valuations: data.asset.valuations
				})
			}
			else {
				//Revert states back to the prop values
				this.setState({
					name: this.props.asset.name,
					description: this.props.asset.description,
					valuations: this.props.asset.valuations,
				})
			}
		})

		this.setState({
			addMode: false
		})
	}

	handleUpdateAsset = () => {
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
		formData.append("valuations", JSON.stringify(this.state.valuations));

		fetch(EndpointUrl + '/assets/' + this.props.asset._id, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then((data) => {
			if(data.success) {
				this.props.refreshData();
				this.setState({
					name: data.asset.name,
					description: data.asset.description,
					valuations: data.asset.valuations
				})
			}
			else {
				//Revert states back to the prop values
				this.setState({
					name: this.props.asset.name,
					description: this.props.asset.description,
					valuations: this.props.asset.valuations,
				})
			}
		})
	}

	render() {	
		return (
			<div className="dashboard-asset-config-card">
				<input className="dashboard-asset-config-card-item" disabled={!this.state.editMode} value={this.state.name} onInput={this.handleNameChange}></input>
				<input className="dashboard-asset-config-card-item" disabled={!this.state.editMode} value={this.state.description} onInput={this.handleDescriptionChange}></input>
				<div className="dashboard-config-card-date">
					<DatePicker
						selected={new Date(this.state.valuations[0].date)}
						onChange={(date) => this.handleCurrentDateChange(date)}
						dateFormat="d MMM yyyy"
					/>
				</div>
				<input className="dashboard-asset-config-card-item" disabled={!this.state.editMode && !this.state.addMode} value={'$' + this.numberWithCommas(this.state.valuations[0].value / 100)} onInput={(e) => this.handleCurrentValueChange(e)}></input>
				{(!this.state.addMode && !this.state.editMode) &&
					<div className="dashboard-share-config-card-dollar-icon" onClick={this.addMode}>
						<DollarIcon />
					</div>
				}
				{(!this.state.editMode && !this.state.addMode) &&
					<div className="dashboard-share-config-card-edit-icon" onClick={this.modifyMode}>
						<EditIcon />
					</div>
				}
				{(this.state.editMode || this.state.addMode) &&
					<div className="dashboard-share-config-card-tick-icon" onClick={this.update}>
						<TickIcon />
					</div>
				}			
				{(this.state.editMode || this.state.addMode) &&
					<div className="dashboard-share-config-card-cross-icon" onClick={this.cancelMode}>
						<CrossIcon />
					</div>
				}
				<div className="dashboard-share-config-card-delete-icon" onClick={this.delete}>
					<DeleteIcon />
				</div>	
				{(this.state.editMode) && 
					this.state.valuations.slice(1,).map(valuation => (
						<div className="dashboard-asset-valuation-entry">
							<div className="dashboard-config-card-date">
								<DatePicker
									selected={new Date(valuation.date)}
									onChange={(date) => this.handleValuationDateChange(date, valuation._id)}
									dateFormat="d MMM yyyy"
								/>
							</div>
							<input className="dashboard-asset-config-card-item" value={'$' + this.numberWithCommas(valuation.value / 100)} onInput={(e) => this.handleValuationValueChange(e, valuation._id)} disabled={!this.state.editMode}>
							</input>
							<div className="dashboard-asset-config-card-item"></div>
							<div className="dashboard-asset-config-card-item"></div>
							<div className="dashboard-share-config-card-delete-icon" onClick={(e) => this.handleDeleteValuation(valuation._id)}>
								<DeleteIcon />
							</div>
						</div>
					))
				}
			</div>
		)
	}
}