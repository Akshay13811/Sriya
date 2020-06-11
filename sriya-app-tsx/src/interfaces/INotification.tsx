export type NotificationInfo = {
	name: string;
	details: string;
	type: NoticationType;
	timestamp: Date;
}

export enum NoticationType {
	INFO,
	WARNING,
	ERROR
}