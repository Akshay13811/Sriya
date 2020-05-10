export interface IAsset {
	_id: string;
	name: string;
	description: string;
	valuations: Array<IValuation>;
} 

export interface IValuation {
	_id: string;
	date: number;
	value: number;
}
