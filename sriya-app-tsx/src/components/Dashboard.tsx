import React from 'react';

//Components
import { AccountCard } from './Cards/AccountCard';
import { SharePortfolioCard } from './Cards/SharePortfolioCard';
import { ShareChartCard } from './Cards/ShareChartCard';
import { DashboardBar } from './DashboardBar';

//Constants
import { EndpointUrl } from '../Configuration';

//Interfaces
import { IAccount } from '../interfaces/IAccount';
import { IShare } from '../interfaces/IShare';

interface IProps {}
interface IState {
	accounts: Array<IAccount>;
	shares: Array<IShare>;
	sharesCombined: Array<IShare>;
	refreshAccountCard: () => void;
}

export class Dashboard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			accounts: [],
			shares: [],
			sharesCombined: [],
			refreshAccountCard: () => {}
		}
	}

	componentDidMount() {
		this.fetchAccountData();
		this.fetchShareData();
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

		this.state.refreshAccountCard();
	}

	fetchShareData() {
		fetch(EndpointUrl+'/shares', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				shares: data
			})
		})
		.catch(console.log)

		fetch(EndpointUrl+'/sharescombined', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				sharesCombined: data
			})
		})
		.catch(console.log)
	}

	renderAccountCard(row: number, column: number) {
		return (
			<AccountCard
				refreshCard={(callable: () => void) => this.setState({refreshAccountCard: callable})}
				row = {row}
				column = {column}
			/>
		)
	}

	renderSharePortfolioCard(row: number, column: number) {
		return (
			<SharePortfolioCard
				shares = {this.state.sharesCombined}
				row = {row}
				column = {column}
			/>
		)
	}

	renderShareChartCard(row: number, column: number) {
		return (
			<ShareChartCard
				refreshCard={(callable: () => void) => this.setState({refreshAccountCard: callable})}
				row = {row}
				column = {column}
			/>
		)
	}

	renderBar() {
		return (
			<DashboardBar
				accounts={this.state.accounts}
				shares={this.state.shares}
				refreshAccountData={() => this.fetchAccountData()}
				refreshShareData={() => this.fetchShareData()}
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
					{this.renderAccountCard(1,1)}
					{this.renderSharePortfolioCard(2,3)}
					{this.renderShareChartCard(1,3)}
				</div>
			</div>
		)
	}
}
