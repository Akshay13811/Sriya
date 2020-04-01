export interface IAccount {
	_id: string;
	name: string;
	current_balance: number;
	transactions: Array<ITransaction>;
} 

export interface ITransaction {
	_id: string;
	date: string;
	description: string;
	amount: number
}
