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
	row: number;
	column: number;
}

interface IState {
	data: IGraphData;
	chartConfiguration: number;
}

export class ShareChartCard extends React.Component<IProps, IState> {
	
	constructor(props: IProps) {
		super(props);
		this.state = {
			data: {},
			chartConfiguration: 1,
		}
	}

	componentDidMount() {
		this.fetchAccountGraphData();
		this.props.refreshCard(this.fetchAccountGraphData.bind(this));
	 }
	
	fetchAccountGraphData() {
		var period = ChartConfigurations[this.state.chartConfiguration].period;
		var interval = ChartConfigurations[this.state.chartConfiguration].interval;
		fetch(EndpointUrl+'/shares/graph/'+period+'/'+interval, {mode: 'cors'})
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
			this.fetchAccountGraphData();
		})
	}

	render() {
		return (
			<div className="dashboard-account-card" style={{gridColumn: this.props.column, gridRow: this.props.row}}>
				<div className="dashboard-card-header">{"Shares"}</div>
				<ChartOptions 
					configuration={this.state.chartConfiguration}
					changeConfiguration={(i) => this.changeConfiguration(i)}
				/>
				<Chart 
					data={this.state.data}
					configuration={this.state.chartConfiguration}
					color={'rgba(253,202,110,1)'}
				/>
			</div>
		);
	}
}
