import React from 'react';

//Components
import {AccountCard} from './AccountCard';
import {DashboardBar} from './DashboardBar';

//Constants
import {EndpointUrl} from '../Configuration';
import { IAccount } from '../interfaces/IAccount';

interface IProps {}
interface IState {
	accounts: Array<IAccount>;
}

export class Dashboard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			accounts: [],
		}
	}

	componentDidMount() {
		this.fetchAccountData();
	}

	fetchAccountData() {
		fetch(EndpointUrl+'/accounts', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				accounts: data
			})
		})
		.catch(console.log)
	}

	renderAccountCard() {
		return (
			<AccountCard
			/>
		)
	}

	renderBar() {
		return (
			<DashboardBar
				accounts={this.state.accounts}
			/>
		)
	}

	render() {
		return(
			<div className="dashboard">
				<div>
					{this.renderBar()}
				</div>
				<div className="dashboard-main-container">
					{this.renderAccountCard()}
				</div>
			</div>
		)
	}
}
