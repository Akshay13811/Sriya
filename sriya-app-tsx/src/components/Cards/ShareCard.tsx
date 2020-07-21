import React from 'react';

//Constants
import { EndpointUrl } from '../../Configuration';

//Interfaces
import { IShare } from '../../interfaces/IShare';

//Images
import {ReactComponent as ShareUp} from '../../images/share-up.svg';
import {ReactComponent as ShareDown} from '../../images/share-down.svg';
import {ReactComponent as ShareNeutral} from '../../images/share-neutral2.svg';

interface IProps {
	share: IShare;
}

interface IState {
	currentSharePrice: number;
	lastCloseSharePrice: number;
}

export class ShareCard extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			currentSharePrice: 0,
			lastCloseSharePrice: 0
		}
	}

	componentDidMount() {
		this.fetchShareData();
	}

	numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	numberWithCommasStr(x: string) {
		return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	fetchShareData() {
		fetch(EndpointUrl+'/dailyshare/' + this.props.share.index + "/" + this.props.share.code, {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data) => {
			this.setState({
				currentSharePrice: data.currentSharePrice,
				lastCloseSharePrice: data.lastCloseSharePrice
			})
		})
		.catch(console.log)
	}

	renderShareIndicator(change: number) {
		return (
			<div className="center-icon">
				{ change > 0 ? <ShareUp />
				: change === 0 ? <ShareNeutral />
				: <ShareDown />
				}
			</div>
		)
	}

	render() {
		var code = this.props.share.code.toUpperCase();
		var currentValue = 0;

		var overallTextColour = "right-text neutral-text";
		var overallDifference = 0;
		var overallPercentage = 0;
		if(this.state.currentSharePrice !== 0) {
			var purchaseValue = this.props.share.purchasePrice * this.props.share.numberOfShares
			currentValue = this.state.currentSharePrice * this.props.share.numberOfShares;	
			overallDifference = currentValue - purchaseValue;
			if(purchaseValue !== 0) {
				overallPercentage = overallDifference / purchaseValue * 100;
			}
		
			if(overallDifference > 0) {
				overallTextColour = "right-text green-text";
			}
			else if(overallDifference < 0) {
				overallTextColour = "right-text red-text";
			}
		}

		var dailyTextColour = "right-text neutral-text";
		var dailyDifference = 0;
		var dailyPercentage = 0;
		if(this.state.lastCloseSharePrice !== 0) {
			var previousValue = this.state.lastCloseSharePrice * this.props.share.numberOfShares;
			dailyDifference = currentValue - previousValue;
			dailyPercentage = dailyDifference / previousValue * 100;

			if(dailyDifference > 0) {
				dailyTextColour = "right-text green-text";
			}
			else if(dailyDifference < 0) {
				dailyTextColour = "right-text red-text";
			}
		}

		var sharePriceDiff = this.state.currentSharePrice - this.state.lastCloseSharePrice;
		return (
			<div className="dashboard-share-card">
				{this.renderShareIndicator(dailyPercentage)}
				<div className="center-text">{code}</div>
				<div className="right-text">${this.numberWithCommasStr(currentValue.toFixed(2))}</div>
				<div className="double-row">
					<div className={overallTextColour}>
						{overallPercentage.toFixed(2)}%
					</div>
					<div className={overallTextColour}>
						${this.numberWithCommasStr(overallDifference.toFixed(2))}
					</div>
				</div>
				<div className="double-row">
					<div className={`right-text`}>${this.numberWithCommasStr(this.state.currentSharePrice.toFixed(2))}</div>
					<div className={`right-text ${dailyTextColour}`}>${this.numberWithCommasStr(sharePriceDiff.toFixed(2))}</div>
				</div>
				<div className="double-row">
					<div className={dailyTextColour}>
						{dailyPercentage.toFixed(2)}%
					</div>
					<div className={dailyTextColour}>
						${this.numberWithCommasStr(dailyDifference.toFixed(2))}
					</div>
				</div>
			</div>
		);
	}

}