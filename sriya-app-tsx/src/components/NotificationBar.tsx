import React from 'react';
import { NotificationInfo } from '../interfaces/INotification';
import { NotificationCard } from './Cards/NotificationCard';

interface IProps {
	showNotifications: boolean;
	notifications: Array<NotificationInfo>
}

export class NotificationBar extends React.Component<IProps> {
	constructor(props: IProps) {
		super(props);
	}

	render () {
		return (
			<div className={this.props.showNotifications ? 'notification-bar slideOut' : 'notification-bar slideIn'}>
				<div className="notification-bar-list">
						{this.props.notifications.map(notification => (
							<NotificationCard
								notification = {notification}
								visiblity = {this.props.showNotifications}
							/>
						))}
				</div>
			</div>
		)
	}
}