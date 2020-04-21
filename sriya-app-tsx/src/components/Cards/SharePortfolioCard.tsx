import React from 'react';

//Interfaces
import { IShare } from '../../interfaces/IShare';

//Components
import { ShareCard } from './ShareCard'

interface IProps {
	shares: Array<IShare>;
	row: number;
	column: number;
}

interface IState {

}

export class SharePortfolioCard extends React.Component<IProps, IState> {

	render() {
		return (
			<div className="dashboard-share-portfolio-card" style={{gridColumn: this.props.column, gridRow: this.props.row}}>
				<div className="dashboard-card-header">{"Share Portfolio"}</div>
				{this.props.shares.map(share => (
					<ShareCard
						share = {share}
					/>
				))}
			</div>
		);
	}

}