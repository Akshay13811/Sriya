import React from 'react';

//Interfaces
import {IGraphData} from '../interfaces/IGraphData';

//Components
import {Chart} from './Chart';
import {ChartPeriods} from './Chart';

//Constants
import {EndpointUrl} from '../Configuration';

//Images
import {ReactComponent as DropdownIcon} from '../images/dropdown.svg';

interface IProps {
}

interface IState {
	data: IGraphData;
	interval: number;
	period: number;
	showDropdown: boolean;
}

export class AccountCard extends React.Component<IProps, IState> {
	
	constructor(props: IProps) {
		super(props);
		this.state = {
			data: {},
			interval: 7,
			period: 28,
			showDropdown: false
		}
	}
	
	fetchAccountGraphData() {
		fetch(EndpointUrl+'/accounts/graph/'+this.state.period+'/'+this.state.interval, {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				data: data
			})
		})
		.catch(console.log)
	}

	componentDidMount() {
		this.fetchAccountGraphData();
	}

	showDropdown() {
		this.setState({
			showDropdown: true
		});
	}

	hideDropdown() {
		this.setState({
			showDropdown: false
		});
	}

	changeGraphPeriod(period: number, interval: number) {
		this.setState({
			period: period,
			interval: interval
		}, () => {
			this.fetchAccountGraphData();
		})
	}

	render() {
		return (
			<div className="dashboard-card">
				<div className="dashboard-card-header">{"Cash Total"}</div>
				<div className="dashboard-chart-options">
					<div className={this.state.period == ChartPeriods.WEEK.period ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
						onClick={() => this.changeGraphPeriod(ChartPeriods.WEEK.period, ChartPeriods.WEEK.interval)}>
						1 Week
					</div>
					<div className={this.state.period == ChartPeriods.ONEMONTH.period ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
						onClick={() => this.changeGraphPeriod(ChartPeriods.ONEMONTH.period, ChartPeriods.ONEMONTH.interval)}>
						1 Month
					</div>
					<div className={this.state.period == ChartPeriods.THREEMONTHS.period ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
						onClick={() => this.changeGraphPeriod(ChartPeriods.THREEMONTHS.period, ChartPeriods.THREEMONTHS.interval)}>
						3 Months
					</div>
					<div className="dashboard-chart-option" onMouseOver={() => this.showDropdown()} onMouseLeave={() => this.hideDropdown()}>
						<DropdownIcon />
						<div className={this.state.showDropdown ? "dashboard-chart-dropdown fadeIn" : "dashboard-chart-dropdown fadeOut"} >
							<div className={this.state.period == ChartPeriods.SIXMONTHS.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.SIXMONTHS.period, ChartPeriods.SIXMONTHS.interval)}>
								6 Months
							</div>
							<div className={this.state.period == ChartPeriods.ONEYEAR.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.ONEYEAR.period, ChartPeriods.ONEYEAR.interval)}>
								1 Year
							</div>
							<div className={this.state.period == ChartPeriods.THREEYEARS.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.THREEYEARS.period, ChartPeriods.THREEYEARS.interval)}>
								3 Years
							</div>
							<div className={this.state.period == ChartPeriods.FIVEYEARS.period ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
								onClick={() => this.changeGraphPeriod(ChartPeriods.FIVEYEARS.period, ChartPeriods.FIVEYEARS.interval)}>
								5 Years
							</div>
						</div>
					</div>
				</div>
				<Chart 
					data={this.state.data}
					interval={this.state.interval}
					period={this.state.period}
					color={'rgba(116,184,255,1)'}
				/>
			</div>
		);
	}
}
