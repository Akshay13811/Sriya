import React from 'react';
import { EndpointUrl } from '../../Configuration';

//Components
import { TotalCard } from './TotalCard';

//3rd Party Components
import SimpleBar from 'simplebar-react';

interface IProps {
	refreshCard: (refresh: () => void) => void;
}

interface IState {
	accountsTotal: number,
	sharesTotal: number,
	assetsTotal: number,
	loansTotal: number
}

export class PortfolioBreakdownCard extends React.Component<IProps, IState> {
	 constructor(props: IProps) {
		 super(props);
		 this.state = {
			accountsTotal: 0,
			sharesTotal: 0,
			assetsTotal: 0,
			loansTotal: 0
		 }
	 }

	 componentDidMount() {
		 this.fetchTotals();
		 this.props.refreshCard(this.fetchTotals.bind(this));
	 }

	 fetchTotals() {
		fetch(EndpointUrl + '/accounts/total', {mode: "cors"})
		.then(res => res.json())
		.then((data) => {
			this.setState({
				accountsTotal: data.total
			})
		})

		fetch(EndpointUrl + '/shares/total', {mode: "cors"})
		.then(res => res.json())
		.then((data) => {
			this.setState({
				sharesTotal: data.total
			})
		})

		fetch(EndpointUrl + '/assets/total', {mode: "cors"})
		.then(res => res.json())
		.then((data) => {
			this.setState({
				assetsTotal: data.total
			})
		})

		fetch(EndpointUrl + '/loans/total', {mode: "cors"})
		.then(res => res.json())
		.then((data) => {
			this.setState({
				loansTotal: data.total
			})
		})
	 }

	 overallTotal() {
		 return (this.state.accountsTotal + this.state.sharesTotal + this.state.assetsTotal - this.state.loansTotal);
	 }

	 numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	 render() {
		 return (
			<div className="dashboard-card dashboard-portfolio-breakdown-card">
				<div className="dashboard-card-header">{"Portfolio Breakdown"}</div>
					<SimpleBar>	
						<div className="dashboard-portfolio-breakdown-list">
							<TotalCard
								label = {"Cash"}
								total = {this.state.accountsTotal}
								color={'rgba(86,238,197,1)'}
							/>
							<TotalCard
								label = {"Shares"}
								total = {this.state.sharesTotal}
								color={'rgba(253,202,110,1)'}
							/>
							<TotalCard
								label = {"Assets"}
								total = {this.state.assetsTotal}
								color={'rgba(163,155,254,1)'}
							/>
							<TotalCard
								label = {"Debt"}
								total = {this.state.loansTotal}
								color={'rgba(255,118,116,1)'}
							/>
							<div className="dashboard-portfolio-breakdown-total">
								<div className="dashboard-total-card-label">
									{"Total"}
								</div>
								<div className="dashboard-total-card-total">
									${this.numberWithCommas(Math.round(this.overallTotal()/100))}
								</div>
							</div>
						</div>
					</SimpleBar>
				</div>
		 )
	 }
}
