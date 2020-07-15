import React from 'react';

//Components
import { PortfolioChartCard } from './Cards/PortfolioChartCard'
import { PortfolioBreakdownCard } from './Cards/PortfolioBreakdownCard'
import { AssetChartCard } from './Cards/AssetChartCard';
import { AccountChartCard } from './Cards/AccountChartCard';
import { LoanChartCard } from './Cards/LoanChartCard'
import { SharePortfolioCard } from './Cards/SharePortfolioCard';
import { ShareChartCard } from './Cards/ShareChartCard';

import { LoansDetailCard } from './Cards/LoansDetailCard';

import { DashboardBar } from './DashboardBar';

//Constants
import { EndpointUrl } from '../Configuration';
import { UpdateHistoryStatus } from '../Common';
import { ShareChartType } from '../Common';

//Interfaces
import { IAccount } from '../interfaces/IAccount';
import { IShare } from '../interfaces/IShare';
import { IAsset } from '../interfaces/IAsset';
import { ILoan } from '../interfaces/ILoan';
import { NotificationInfo, NoticationType as NotificationType } from '../interfaces/INotification';

enum View {
	Dashboard,
	LoanDetail,
	ShareDetail
}

interface IProps {}
interface IState {
	accounts: Array<IAccount>;
	shares: Array<IShare>;
	assets: Array<IAsset>;
	loans: Array<ILoan>;
	sharesCombined: Array<IShare>;
	notifications: Array<NotificationInfo>;

	view: View;

	refreshAccountCard: () => void;
	refreshShareCard: () => void;
	refreshLoanCard: () => void;
	refreshAssetCard: () => void;
	refreshPortfolioCard: () => void;
}

export class Dashboard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			accounts: [],
			shares: [],
			assets: [],
			loans: [],
			sharesCombined: [],
			notifications: [],
			view: View.Dashboard,
			refreshAccountCard: () => {},
			refreshShareCard: () => {},
			refreshLoanCard: () => {},
			refreshAssetCard: () => {},
			refreshPortfolioCard: () => {},
		}
	}

	componentDidMount() {
		this.updatesharehistory();
		this.fetchAccountData();
		this.fetchShareData();
		this.fetchAssetData();
		this.fetchLoanData();
	}

	updatesharehistory() {
		fetch(EndpointUrl+'/shares/updatesharehistory', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			let notifications = this.state.notifications

			if(!data) {
				let notification: NotificationInfo = {
					name: "Share History",
					details: "Error requesting server to update share history",
					type: NotificationType.ERROR,
					timestamp: new Date(data.timestamp)
				}
				notifications.push(notification);
			}
			else if(data.status == UpdateHistoryStatus.UPDATE_ALREADY_IN_PROGRESS) {
				let notification: NotificationInfo = {
					name: "Share History",
					details: "Update already in progress",
					type: NotificationType.INFO,
					timestamp: new Date(data.timestamp)
				}
				notifications.push(notification);
			}
			else if(data.status == UpdateHistoryStatus.UPDATE_SUCCESSFUL) {
				let updatedShares: Array<{index: string, code: string}> = [];
				let noUpdateShares: Array<{index: string, code: string}> = [];
				let failedShares: Array<{index: string, code: string}> = [];
				for (let shareUpdate of data.updates) {

					if(shareUpdate.status === "failed") {
						console.log(shareUpdate);
						failedShares.push({index: shareUpdate.index, code: shareUpdate.code})
					}
					else if(shareUpdate.updated) {
						updatedShares.push({index: shareUpdate.index, code: shareUpdate.code})
					}
					else {
						noUpdateShares.push({index: shareUpdate.index, code: shareUpdate.code})
					}
				}

				if(updatedShares.length > 0) {
					let details: string = "Updated history for ";
					for(let i=0; i<updatedShares.length; i++) {
						details += updatedShares[i].code;
						if(i+1 != updatedShares.length) {
							details += ", ";
						}
					}
					details += ".";

					let notification: NotificationInfo = {
						name: "Share History",
						details: details,
						type: NotificationType.INFO,
						timestamp: new Date(data.timestamp)
					}
					notifications.push(notification);
				}

				if(noUpdateShares.length > 0) {
					let details: string = "No update required for ";
					for(let i=0; i<noUpdateShares.length; i++) {
						details += noUpdateShares[i].code;
						if(i+1 != noUpdateShares.length) {
							details += ", ";
						}
					}
					details += ".";

					let notification: NotificationInfo = {
						name: "Share History",
						details: details,
						type: NotificationType.INFO,
						timestamp: new Date(data.timestamp)
					}
					notifications.push(notification);
				}

				if(failedShares.length > 0) {
					let details: string = "History update failed for ";
					for(let i=0; i<failedShares.length; i++) {
						details += failedShares[i].code;
						if(i+1 != failedShares.length) {
							details += ", ";
						}
					}
					details += ".";

					let notification: NotificationInfo = {
						name: "Share History",
						details: details,
						type: NotificationType.ERROR,
						timestamp: new Date(data.timestamp)
					}
					notifications.push(notification);
				}
			}

			this.setState({
				notifications: notifications
			})
		})
		.catch(console.log)

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
		this.state.refreshPortfolioCard();
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

		this.state.refreshShareCard();
		this.state.refreshPortfolioCard();
	}

	fetchAssetData() {
		fetch(EndpointUrl+'/assets', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				assets: data
			})
		})
		.catch(console.log)

		this.state.refreshAssetCard();
		this.state.refreshPortfolioCard();
	}

	fetchLoanData() {
		fetch(EndpointUrl+'/loans', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				loans: data
			})
		})
		.catch(console.log)

		this.state.refreshAssetCard();
		this.state.refreshPortfolioCard();
	}

	//Chart cards
	renderAccountChartCard(className?: string) {
		return (
			<AccountChartCard
				refreshCard={(callable: () => void) => this.setState({refreshAccountCard: callable})}
				class = {className}
			/>
		)
	}

	renderShareChartCard(className?: string) {
		return (
			<ShareChartCard
				refreshCard={(callable: () => void) => this.setState({refreshShareCard: callable})}
				class = {className}
				type = {ShareChartType.VALUE}
				titleClick = {this.showSharesDetailView.bind(this)}
			/>
		)
	}

	renderShareROIChartCard(className?: string) {
		return (
			<ShareChartCard
				refreshCard={(callable: () => void) => this.setState({refreshShareCard: callable})}
				class = {className}
				type = {ShareChartType.ROI}
				titleClick = {this.showSharesDetailView.bind(this)}
			/>
		)
	}


	renderLoanChartCard(className?: string) {
		return (
			<LoanChartCard
				refreshCard={(callable: () => void) => this.setState({refreshLoanCard: callable})}
				class = {className}
				titleClick = {this.showLoansDetailView.bind(this)}
			/>
		)
	}

	renderAssetChartCard() {
		return (
			<AssetChartCard
				refreshCard={(callable: () => void) => this.setState({refreshAssetCard: callable})}
			/>
		)
	}

	renderPortfolioChartCard() {
		return (
			<PortfolioChartCard
				refreshCard={(callable: () => void) => this.setState({refreshPortfolioCard: callable})}
			/>
		)
	}

	//Share portfolio card
	renderSharePortfolioCard() {
		return (
			<SharePortfolioCard
				shares = {this.state.sharesCombined}
			/>
		)
	}

	//Overall portfolio breakdown card
	renderPortfolioBreakdownCard() {
		return (
			<PortfolioBreakdownCard
				refreshCard={(callable: () => void) => this.setState({refreshPortfolioCard: callable})}
			/>
		)
	}

	//Detail cards
	renderLoansDetailCard(className?: string) {
		return (
			<LoansDetailCard
				loans = {this.state.loans}
				class = {className}
			/>
		)
	}

	renderShareDetailCard(className?: string) {
		return (
			<div></div>
		)
	}

	//Details View
	renderLoansDetailView() {
		return (
			<div className={this.state.view == View.LoanDetail ? 'detail-main-container dashboardFadeIn' : 'detail-main-container dashboardFadeOut'}>
				{this.renderLoansDetailCard()}
				{this.renderLoanChartCard("detail-chart")}
			</div>
		)
	}

	renderSharesDetailView(rowHeightPercentage?: string) {
		return (
			<div className={this.state.view == View.ShareDetail ? 'detail-main-container dashboardFadeIn' : 'detail-main-container dashboardFadeOut'} style={{gridTemplateRows: `repeat(3, ${rowHeightPercentage}%)`}}>
				{this.renderShareChartCard("detail-chart")}
				{this.renderShareROIChartCard("detail-chart")}
			</div>
		)
	}

	showLoansDetailView() {
		this.setState({
			view: View.LoanDetail
		})
		window.scrollTo(0,0);
	}

	showSharesDetailView() {
		this.setState({
			view: View.ShareDetail
		})
		window.scrollTo(0,0);	
	}

	renderBar() {
		return (
			<DashboardBar
				accounts={this.state.accounts}
				shares={this.state.shares}
				assets={this.state.assets}
				loans={this.state.loans}
				notifications={this.state.notifications}
				refreshAccountData={() => this.fetchAccountData()}
				refreshShareData={() => this.fetchShareData()}
				refreshAssetData={() => this.fetchAssetData()}
				refreshLoanData={() => this.fetchLoanData()}
			/>
		)
	}

	renderTogglePageButton() {
		return (
			<div className="dashboard-detail-button" onClick={() => this.showDetailPage()}>
				...
			</div>
		)
	}

	showDetailPage() {
		let newView: View;
		if(this.state.view == View.LoanDetail || this.state.view == View.ShareDetail) {
			this.setState({
				view: View.Dashboard
			})		
		}
	}

	render() {
		return(
			<div className="dashboard">
				<div>
					{this.renderBar()}
				</div>
				<div className={this.state.view == View.Dashboard ? 'dashboard-main-container dashboardFadeIn' : 'dashboard-main-container dashboardFadeOut'}>
					{this.renderPortfolioChartCard()}
					{this.renderPortfolioBreakdownCard()}       
					{this.renderShareChartCard()}
					{this.renderAccountChartCard()}
					{this.renderLoanChartCard()}
					{this.renderSharePortfolioCard()}
				</div>
				{this.renderLoansDetailView()}
				{this.renderSharesDetailView("33.33")}
				<div>
					{this.renderTogglePageButton()}
				</div>
			</div>
		)
	}
}
