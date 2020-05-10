export interface ILoan {
	_id: string;
	accountName: string;
	bankName: string;
	loanAmount: number;
	currentBalance: number;
	transactions: Array<ITransaction>;
} 

export interface ITransaction {
	_id: string;
	date: string;
	description: string;
	amount: number
}
