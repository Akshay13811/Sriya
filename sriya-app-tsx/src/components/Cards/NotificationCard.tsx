import React from 'react';
import { NotificationInfo, NoticationType } from '../../interfaces/INotification';

interface IProps {
	notification: NotificationInfo;
	visiblity: boolean;
}

const Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"]

export class NotificationCard extends React.Component<IProps> {
	constructor(props: IProps) {
		super(props);
	}

	timestampToString(timestamp: Date) {
		let currDateMs = new Date().setHours(0,0,0,0);
		let timestampMs = timestamp.setHours(0,0,0,0);

		if(timestampMs === currDateMs) {
			return "Today";
		}
		else if(timestampMs === (currDateMs - 86400000)) {
			return "Yesterday";
		}
		else {
			return (`${timestamp.getDate()} ${Months[timestamp.getMonth()]} ${timestamp.getFullYear()}`)
		}
	}

	render() {
		let notifType: string = "";
		if(this.props.notification.type === NoticationType.INFO) {
			notifType = "info-notification-card";
		}
		else if(this.props.notification.type === NoticationType.WARNING) {
			notifType = "warning-notification-card";
		}
		else if(this.props.notification.type === NoticationType.ERROR) {
			notifType = "error-notification-card";
		}

		return (
			<div className={this.props.visiblity ? `notification-card ${notifType} fadeInCard` : `notification-card ${notifType} fadeOutCard`}>
				<div className="notification-card-title">
					{this.props.notification.name}
				</div>
				<div className="notification-card-details">
					{this.props.notification.details}
				</div>
				<div className="notification-card-footer">
					{this.timestampToString(this.props.notification.timestamp)}
				</div>
			</div>
		)
	}
}