import React from 'react';

interface IProps {
	label: string,
	total: number,
	color: string
}

export class TotalCard extends React.Component<IProps> {

	numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	render() {
		return (
			<div className="dashboard-total-card">
				<div className="dashboard-total-card-tag" style={{backgroundColor: this.props.color}}></div>
				<div className="dashboard-total-card-label">{this.props.label}</div>
				<div className="dashboard-total-card-total">${this.numberWithCommas(Math.round(this.props.total/100))}</div>
			</div>
		)
	}
}