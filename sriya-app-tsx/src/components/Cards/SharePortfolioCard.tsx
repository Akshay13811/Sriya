import React from 'react';

//Interfaces
import { IShare } from '../../interfaces/IShare';

//Components
import { ShareCard } from './ShareCard'

//3rd Party Components
import SimpleBar from 'simplebar-react';

interface IProps {
	shares: Array<IShare>;
}

export class SharePortfolioCard extends React.Component<IProps> {

	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className="dashboard-card dashboard-share-portfolio-card">
				<div className="dashboard-card-header">{"Share Portfolio"}</div>
				<SimpleBar>
					<div className="dashboard-share-portfolio-list">
						{this.props.shares.map(share => (
							<ShareCard
								share = {share}
							/>
						))}
					</div>
				</SimpleBar>
			</div>
		);
	}

}