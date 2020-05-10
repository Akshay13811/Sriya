
import React from 'react';

//Constants
import {ChartConfigurations} from './Chart';

//Images
import {ReactComponent as DropdownIcon} from '../images/dropdown.svg';

interface IState {
	showDropdown: boolean;
}

interface IProps {
	configuration: number;
	changeConfiguration: (configuration: number) => void;
}

export class ChartOptions extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			showDropdown: false
		}
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
	render() {
		return (
		<div className="dashboard-chart-options">
			<div className={this.props.configuration === 0 ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
				onClick={() => this.props.changeConfiguration(0)}>
				{ChartConfigurations[0].option}
			</div>
			<div className={this.props.configuration === 1 ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
				onClick={() => this.props.changeConfiguration(1)}>
				{ChartConfigurations[1].option}
			</div>
			<div className={this.props.configuration === 2 ? 'dashboard-chart-option select' : 'dashboard-chart-option'} 
				onClick={() => this.props.changeConfiguration(2)}>
				{ChartConfigurations[2].option}
			</div>
			<div className="dashboard-chart-option" onMouseOver={() => this.showDropdown()} onMouseLeave={() => this.hideDropdown()}>
				<DropdownIcon />
				<div className={this.state.showDropdown ? "dashboard-chart-dropdown fadeIn" : "dashboard-chart-dropdown fadeOut"} >
					<div className={this.props.configuration === 3? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
						onClick={() => this.props.changeConfiguration(3)}>
						{ChartConfigurations[3].option}
					</div>
					<div className={this.props.configuration === 4 ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
						onClick={() => this.props.changeConfiguration(4)}>
						{ChartConfigurations[4].option}
					</div>
					<div className={this.props.configuration === 5 ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
						onClick={() => this.props.changeConfiguration(5)}>
						{ChartConfigurations[5].option}
					</div>
					<div className={this.props.configuration === 6 ? 'dashboard-chart-dropdown-option select' : 'dashboard-chart-dropdown-option'} 
						onClick={() => this.props.changeConfiguration(6)}>
						{ChartConfigurations[6].option}
					</div>
				</div>
			</div>
		</div>
		);
	}
}