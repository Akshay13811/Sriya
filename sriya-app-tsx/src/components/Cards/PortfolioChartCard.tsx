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

export class PortfolioChartCard extends React.Component<IProps, IState> {
	
	constructor(props: IProps) {
		super(props);
		this.state = {
			data: {},
			chartConfiguration: 1,
		}
	}

	componentDidMount() {
		this.fetchPortfolioGraphData();
		this.props.refreshCard(this.fetchPortfolioGraphData.bind(this));
	 }
	
	fetchPortfolioGraphData() {
		var period = ChartConfigurations[this.state.chartConfiguration].period;
		var interval = ChartConfigurations[this.state.chartConfiguration].interval;
		fetch(EndpointUrl+'/portfolio/graph/'+period+'/'+interval, {mode: 'cors'})
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
			this.fetchPortfolioGraphData();
		})
	}

	render() {
		return (
			<div className="dashboard-card dashboard-chart-card">
				<div className="dashboard-card-header">{"Portfolio"}</div>
				<ChartOptions 
					configuration={this.state.chartConfiguration}
					changeConfiguration={(i) => this.changeConfiguration(i)}
				/>
				<Chart 
					data={this.state.data}
					configuration={this.state.chartConfiguration}
					color={'rgba(116,184,255,1)'}
				/>
			</div>
		);
	}
}
