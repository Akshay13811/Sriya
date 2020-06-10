export type NotificationInfo = {
	name: string;
	details: string;
	type: NoticationType
}

export enum NoticationType {
	INFO,
	WARNING,
	ERROR
}