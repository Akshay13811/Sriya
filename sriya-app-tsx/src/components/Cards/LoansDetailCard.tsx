import React from 'react';

//Interfaces
import { ILoan, ILoanDetails } from '../../interfaces/ILoan';

//3rd Party Components
import SimpleBar from 'simplebar-react';

//Constants
import { EndpointUrl } from '../../Configuration';

const LOAN_DETAILS_PERIOD = 90;

interface IProps {
	loans: Array<ILoan>;
	class?: string;
}

interface IState {
	loanDetails: Map<string, ILoanDetails>;
	finalPaymentDates: Map<string, Date | null>;
	overallFinalPaymentDate: Date | null;
}

export class LoansDetailCard extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			loanDetails: new Map(),
			finalPaymentDates: new Map(),
			overallFinalPaymentDate: null
		}
	}

	numberWithCommas(x: number) {
		if(!x) {
			return "0"
		}
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}	

	componentDidUpdate(prevProps: IProps) {
		if(prevProps.loans !== this.props.loans) {
			for(let loan of this.props.loans) {
				this.fetchLoanDetails(loan._id, LOAN_DETAILS_PERIOD);				
			}
		}
	}

	fetchLoanDetails(loanID: string, period: number) {
		fetch(`${EndpointUrl}/loans/details/${loanID}/${period}`, {mode: 'cors'})
		.then(res => res.json()) //parses output to json
		.then((data: ILoanDetails) => {
			let loanDetails = this.state.loanDetails;
			let loanDetail = loanDetails.get(loanID);
			if(loanDetail) {
				loanDetail.interest = data.interest;
				loanDetail.payments = data.payments;
			}
			else {
				loanDetails.set(loanID, {payments: data.payments, interest: data.interest})
			}

			this.getProjectedFinalPaymentDate();

			this.setState({
				loanDetails: loanDetails
			})
		})
		.catch(console.log)
	}


	renderLoanDetailCard(loan: ILoan) {
		let loanDetails = this.state.loanDetails.get(loan._id);
		let finalRepaymentDateStr: string;
		let finalRepaymentDate = this.state.finalPaymentDates.get(loan._id);
		if(finalRepaymentDate) {
			finalRepaymentDateStr = finalRepaymentDate.toLocaleDateString("en-AU")
		}
		else {
			finalRepaymentDateStr = "Projection cannot be provided";
		}

		return (
			<div className="detail-loan-card">
				<div className="detail-loan-card-title">
					{loan.accountName}
				</div>
				<div className="detail-loan-card-details">
					<div className="detail-small-title">{"Lender"}</div>
					<div className="detail-small-title">{"Amount"}</div>
					<div className="detail-small-title">{"Interest Rate"}</div>
					<div className="detail-small-text">{loan.bankName}</div>
					<div className="detail-small-text">${this.numberWithCommas(Math.round(loan.currentBalance / 100))}</div>
					<div className="detail-small-text">{loan.interestRate}%</div>
					<div className="detail-large-title">{`Last ${LOAN_DETAILS_PERIOD} days payments`}</div>
					<div className="detail-large-text">{"$" + (loanDetails ? this.numberWithCommas(Math.round(loanDetails.payments/100)) : "0")}</div>
					<div className="detail-large-title">{`Last ${LOAN_DETAILS_PERIOD} days interest`}</div>
					<div className="detail-large-text">{"$" + (loanDetails ? this.numberWithCommas(Math.round(loanDetails.interest/100)) : "0")}</div>
					<div className="detail-large-title">{"Projected final payment date"}</div>
					<div className="detail-large-text">{finalRepaymentDateStr}</div>
				</div>
			</div>
		)
	}

	getProjectedFinalPaymentDate() {

		let overallProjection = true;
		let overallDays = 0;
		let totalPayments = 0;
		this.state.loanDetails.forEach((value, key) => {
			totalPayments += Math.round(value.payments/100);
		});

		for(let loan of this.props.loans) {
			let interestRate = parseFloat(loan.interestRate)/100;
			let amount = Math.round(loan.currentBalance/100);
			let details = this.state.loanDetails.get(loan._id);

			//Get days based on this specific loans information
			if(details) {
				let payments = Math.round(details.payments/100);
				let days = this.calculateDaysTillFinalPayment(amount, interestRate, payments);

				let finalPaymentDates = this.state.finalPaymentDates;
				if(days !== -1) {
					let date = new Date();
					date.setDate(date.getDate() + days);
					finalPaymentDates.set(loan._id, date);
				}
				else {
					finalPaymentDates.set(loan._id, null);
				}

				this.setState({
					finalPaymentDates: finalPaymentDates
				})
			}

			//Get days for overall final date for all loans
			if(overallProjection) {
				let days = this.calculateDaysTillFinalPayment(amount, interestRate, totalPayments);
				console.log("overall projection");
				console.log(totalPayments);
				console.log(days);
				if(days === -1) {
					overallProjection = false; 
				} else {
					overallDays += days;
				}
			}
		}
		
		if(overallProjection) {
			let overallFinalDate = new Date();
			overallFinalDate.setDate(overallFinalDate.getDate() + overallDays);
	
			this.setState({
				overallFinalPaymentDate: overallFinalDate
			})
		}
	}
	
	calculateDaysTillFinalPayment(amount: number, interestRate: number, payments: number): number {
		let days = 0;
		while(amount > 0) {
			amount += amount * interestRate/365 - payments/LOAN_DETAILS_PERIOD;
			if(amount * interestRate/365 > payments/LOAN_DETAILS_PERIOD) {
				return -1;
			}
			days++;
		}

		return days;
	}

	render() {
		let overallFinalPaymentDateStr: string;
		if(this.state.overallFinalPaymentDate) {
			overallFinalPaymentDateStr = this.state.overallFinalPaymentDate.toLocaleDateString("en-AU")
		}
		else {
			overallFinalPaymentDateStr = "Projection cannot be provided";
		}

		return (
			<div className={`detail-card detail-loans-card ${this.props.class}`}>
				<div className="detail-card-header">{"Loan Information"}</div>
				<SimpleBar className="detail-card-container">
						{this.props.loans.map(loan => (
							this.renderLoanDetailCard(loan)
						))}
						<div className="detail-divider"></div>
						<div className="detail-large-title">{"Projected final payment date"}</div>
						<div className="detail-large-text">{overallFinalPaymentDateStr}</div>
				</SimpleBar>
			</div>
		)
	}
}
