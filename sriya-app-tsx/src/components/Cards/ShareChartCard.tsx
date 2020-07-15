import React from 'react';

//Interfaces
import {IGraphData} from '../../interfaces/IGraphData';

//Components
import {Chart, ChartConfigurations} from '../Chart';
import { ChartOptions } from '../ChartOptions';

//Constants
import { EndpointUrl } from '../../Configuration';
import { IGraphMilestoneData } from '../../interfaces/IGraphMiletoneData';
import { ShareChartType } from '../../Common';

interface IProps {
	refreshCard: (refresh: () => void) => void;
	type: ShareChartType;
	class?: string;
	titleClick : () => void;
}

interface IState {
	data: IGraphData;
	milestones: IGraphMilestoneData;
	chartConfiguration: number;
}

export class ShareChartCard extends React.Component<IProps, IState> {
	
	constructor(props: IProps) {
		super(props);
		this.state = {
			data: {},
			milestones: {data: {}, labels: []},
			chartConfiguration: 1,
		}
	}

	componentDidMount() {
		this.fetchShareGraphData();
		this.props.refreshCard(this.fetchShareGraphData.bind(this));
	 }
	
	fetchShareGraphData() {
		var period = ChartConfigurations[this.state.chartConfiguration].period;
		var interval = ChartConfigurations[this.state.chartConfiguration].interval;
		fetch(EndpointUrl+'/shares/graph/'+period+'/'+interval, {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			let milestoneData: {[key: string]: number | null} = {};
			let milestoneLabels: (string[] | null)[] = [];
			if(data.soldData || data.purchaseData) {
				for(let key in data.graphData) {
					var label = [];
					if(data.soldData && data.soldData[key]) {
						for(let share of data.soldData[key]) {
							let labelString = "Sold ";
							labelString += `${share.units} units of ${share.code} for $${Math.round(share.value)} ($${(share.value/share.units).toFixed(2)} per share)`;
							label.push(labelString);
						}
					}

					if(data.purchaseData && data.purchaseData[key]) {
						for(let share of data.purchaseData[key]) {
							let labelString = "Purchased ";
							labelString += `${share.units} units of ${share.code} for $${Math.round(share.value)} ($${(share.value/share.units).toFixed(2)} per share)`;
							label.push(labelString);
						}
					}

					if(!data.soldData[key] && !data.purchaseData[key]){
						milestoneData[key] = null;
						milestoneLabels.push(null);
					}
					else {
						if(this.props.type === ShareChartType.VALUE) {
							milestoneData[key] = data.graphData[key];
						}
						else if(this.props.type === ShareChartType.ROI) {
							milestoneData[key] = data.roiGraphData[key];
						}
						milestoneLabels.push(label);
					}
				}
			}
			let milestones: IGraphMilestoneData = {data:{}, labels: []};
			milestones.data = milestoneData;
			milestones.labels = milestoneLabels;

			if(this.props.type == ShareChartType.VALUE) {
				this.setState({
					data: data.graphData,
					milestones: milestones
				})
			}
			else if(this.props.type == ShareChartType.ROI) {
				this.setState({
					data: data.roiGraphData,
					milestones: milestones
				})
			}
		})
		.catch(console.log)
	}

	changeConfiguration(configuration: number) {
		this.setState({
			chartConfiguration: configuration
		}, () => {
			this.fetchShareGraphData();
		})
	}

	render() {
		let units: string = "";
		if(this.props.type == ShareChartType.VALUE) {
			units = '$';
		}
		else if(this.props.type == ShareChartType.ROI) {
			units = '%';
		}

		return (
			<div className={`dashboard-card dashboard-chart-card ${this.props.class}`}>
				<div className="dashboard-card-header" onClick={() => {this.props.titleClick()}}>{"Shares"}</div>
				<ChartOptions 
					configuration={this.state.chartConfiguration}
					changeConfiguration={(i) => this.changeConfiguration(i)}
				/>
				<Chart 
					data={this.state.data}
					milestones={this.state.milestones}
					configuration={this.state.chartConfiguration}
					color={'rgba(253,202,110,1)'}
					units={units}
				/>
			</div>
		);
	}
}
