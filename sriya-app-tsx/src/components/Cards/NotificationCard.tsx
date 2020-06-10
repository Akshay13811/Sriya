import React from 'react';
import { NotificationInfo } from '../../interfaces/INotification';

interface IProps {
	notification: NotificationInfo;
	visiblity: boolean;
}

export class NotificationCard extends React.Component<IProps> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={this.props.visiblity ? 'notification-card fadeInCard' : 'notification-card fadeOutCard'}>
				<div className="notification-card-title">
					{this.props.notification.name}
				</div>
				<div className="notification-card-details">
					{this.props.notification.details}
				</div>
			</div>
		)
	}
}