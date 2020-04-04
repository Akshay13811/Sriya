export interface IAccount {
	_id: string;
	accountName: string;
	bankName: string;
	currentBalance: number;
	transactions: Array<ITransaction>;
} 

export interface ITransaction {
	_id: string;
	date: string;
	description: string;
	amount: number
}
