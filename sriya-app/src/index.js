import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//Bootstrap Elements
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

//3rd party
import {Line} from 'react-chartjs-2';

var endpointUrl = 'http://localhost:3002';

class Chart extends React.Component {
	render() {
		return (
			<div className="dashboard-chart">
				<Line
					data={this.props.data}
					options={{
						maintainAspectRatio: false,
						legend: {
						display: false
						},
						scales: {
							xAxes: [{
								gridLines: {
									display: false,
									drawTicks: true,	
								},
								ticks: {
									fontColor: 'rgba(255,255,255,1)'
								}
							}],
							yAxes: [{
								gridLines: {
									color: 'rgba(255,255,255,0.1)',
									lineWidth: 5,
								},
								ticks: {
									fontColor: 'rgba(255,255,255,1)',
									stepSize: 20
								}
							}]
						}
					}}
				/>
			</div>
		);
	}
}

class SharesCard extends React.Component {
	render() {
		//Temporary code
		var data2 = {
			labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			datasets: [{
				label: this.props.title,
				fill: false,
				backgroundColor: 'rgba(253,202,110,1)',
				borderColor: 'rgba(253,202,110,1)',
				data: [
					24,
					45,
					32,
					65,
					67,
					55,
					34
				]
			}]
		}

		return (
			<div className="dashboard-card" style={{height: this.props.height}}>
				<div className="dashboard-card-header">{"Share Portfolio"}</div>
				<Chart data={data2} />
			</div>
		);
	}
}

class AccountCard extends React.Component {
	render() {
		var totalAmount = 0;
		for(var i=0; i<this.props.accounts.length; i++) {
			totalAmount += this.props.accounts[i].current_balance
		}

		//Temporary code
		var data = {
			labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			datasets: [{
				label: this.props.title,
				fill: false,
				backgroundColor: 'rgba(116,184,255,1)',
				borderColor: 'rgba(116,184,255,1)',
				data: [
					24,
					45,
					32,
					65,
					67,
					55,
					34
				]
			}]
		}

		var data2 = {
			labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			datasets: [{
				label: this.props.title,
				fill: false,
				backgroundColor: 'rgba(253,202,110,1)',
				borderColor: 'rgba(253,202,110,1)',
				data: [
					24,
					45,
					32,
					65,
					67,
					55,
					34
				]
			}]
		}

		return (
			<div className="dashboard-card" style={{height: this.props.height}}>
				<div className="dashboard-card-header">{"Cash Total"}</div>
				<Chart data={data} />
			</div>
		);
	}
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			accounts: []
		}
	}

	componentDidMount() {
		this.fetchAccountData();
		this.calculateCardHeight();
	}

	fetchAccountData() {
		fetch(endpointUrl+'/accounts', {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			console.log(data);
			this.setState({
				accounts: data
			})
		})
		.catch(console.log)
	}

	calculateCardHeight() {
		this.setState({
			cardHeight: document.documentElement.clientHeight/3
		})
	}

	renderAccountCard() {
		return (
			<AccountCard
				accounts={this.state.accounts}
			/>
		)
	}

	renderSharesCard() {
		return (
			<SharesCard
			/>
		)
	}

	render() {
		return(
			<Container fluid noGutters={true}>
				<Row className="dashboard-row" noGutters={true}>
					<Col sm={12} md={4}>{this.renderAccountCard()}</Col>
					<Col sm={12} md={4}>{this.renderSharesCard()}</Col>
					<Col sm={12} md={4}>{this.renderAccountCard()}</Col>
				</Row>
				<Row className="dashboard-row" noGutters={true}>
					<Col sm={12} md={4}>{this.renderAccountCard()}</Col>
					<Col sm={12} md={4}>{this.renderSharesCard()}</Col>
					<Col sm={12} md={4}>{this.renderAccountCard()}</Col>
				</Row>
				<Row className="dashboard-row" noGutters={true}>
					<Col sm={12} md={4}>{this.renderAccountCard()}</Col>
					<Col sm={12} md={4}>{this.renderSharesCard()}</Col>
					<Col sm={12} md={4}>{this.renderAccountCard()}</Col>
				</Row>
			</Container>
		)
	}
}

// ==========================================

ReactDOM.render(
	<Dashboard />,
	document.getElementById('root')	
);