import React from 'react';

//Interfaces
import {IGraphData} from '../../interfaces/IGraphData';

//Components
import {Chart, ChartConfigurations} from '../Chart';
import { ChartOptions } from '../ChartOptions';

//Constants
import {EndpointUrl} from '../../Configuration';

interface IProps {
	refreshCard: (refresh: () => void) => void;
}

interface IState {
	data: IGraphData;
	chartConfiguration: number;
}

export class AssetChartCard extends React.Component<IProps, IState> {
	
	constructor(props: IProps) {
		super(props);
		this.state = {
			data: {},
			chartConfiguration: 1,
		}
	}

	componentDidMount() {
		this.fetchAssetGraphData();
		this.props.refreshCard(this.fetchAssetGraphData.bind(this));
	 }
	
	 fetchAssetGraphData() {
		var period = ChartConfigurations[this.state.chartConfiguration].period;
		var interval = ChartConfigurations[this.state.chartConfiguration].interval;
		fetch(EndpointUrl+'/assets/graph/'+period+'/'+interval, {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				data: data
			})
		})
		.catch(console.log)
	}

	changeConfiguration(configuration: number) {
		this.setState({
			chartConfiguration: configuration
		}, () => {
			this.fetchAssetGraphData();
		})
	}

	render() {
		return (
			<div className="dashboard-card dashboard-chart-card">
				<div className="dashboard-card-header">{"Loans"}</div>
				<ChartOptions 
					configuration={this.state.chartConfiguration}
					changeConfiguration={(i) => this.changeConfiguration(i)}
				/>
				<Chart 
					data={this.state.data}
					configuration={this.state.chartConfiguration}
					color={'rgba(255,118,116,1)'}
					units={'$'}
				/>
			</div>
		);
	}
}
