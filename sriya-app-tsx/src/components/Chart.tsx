import React from 'react';

//Interfaces
import {IGraphData} from '../interfaces/IGraphData';

//3rd party chart library
import {Line} from 'react-chartjs-2';

export const ChartPeriods = {
	WEEK: {
		//1 Week
		period: 7,
		interval: 1
	},
	ONEMONTH: {
		//1 Month
		period: 28,
		interval: 7
	},
	THREEMONTHS: {
		//3 Months
		period: 90,
		interval: 15
	},
	SIXMONTHS: {
		//6 Months
		period: 180,
		interval: 60
	},
	ONEYEAR: {
		//1 Year
		period: 365,
		interval: 90
	},
	THREEYEARS: {
		//3 Years
		period: 365*3,
		interval: 365*0.5
	},
	FIVEYEARS: {
		//5 Years
		period: 365*5,
		interval: 365
	}
}

interface IProps {
	data: IGraphData;
	period: number;
	interval: number;
	color: string;
}

export class Chart extends React.Component<IProps> {

	getStepSize(numOfSteps: number) {
		var data = Object.values(this.props.data);

		if(data.length == 0)
			return null;
	
		var min = data[0];
		var max = data[0];
		for(var i=0; i<data.length; i++) {
			if(data[i] < min)
				min = data[i];
			if(data[i] > max)
				max = data[i];
		}
	
		var range = max - min;
		var magnitude = Math.pow(10, Math.floor(range).toString().length - 1);
		var roundedRange = (Math.round(range / magnitude) * magnitude);
	
		return roundedRange/numOfSteps;
	}

	getLabels() {
		var labels = [];
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

		if(this.props.period == ChartPeriods.WEEK.period) {
			var keys = Object.keys(this.props.data);
			for(var key in keys) {
				var date = new Date(key);
				labels.push(days[date.getDay()]);
			}
		}
		else if(this.props.period == ChartPeriods.ONEMONTH.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(date.getDate() + '-' + months[date.getMonth()])
			}
		}
		else if(this.props.period == ChartPeriods.THREEMONTHS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(date.getDate() + '-' + months[date.getMonth()])
			}
		}
		else if(this.props.period == ChartPeriods.SIXMONTHS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.period == ChartPeriods.ONEYEAR.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.period == ChartPeriods.THREEYEARS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.period == ChartPeriods.FIVEYEARS.period) {
			var keys = Object.keys(this.props.data);
			for(var i=0; i<keys.length; i++) {
				var date = new Date(parseInt(keys[i]));
				labels.push(date.getFullYear())
			}
		}
		
		return labels;
	}

	render() {
		var stepSize = this.getStepSize(4);
		var labels = this.getLabels();

		var data = {
			labels: labels.reverse(),
			datasets: [{
				fill: false,
				backgroundColor: [this.props.color],
				borderColor: [this.props.color],
				data: Object.values(this.props.data).reverse()
			}]
		}

		return (
			<div className="dashboard-chart">
				<Line
					data={data}
					options={{
						maintainAspectRatio: false,
						legend: {
						display: false
						},
						scales: {
							xAxes: [{
								gridLines: {
									display: false,
									drawTicks: true,	
								},
								ticks: {
									fontColor: 'rgba(255,255,255,1)'
								}
							}],
							yAxes: [{
								gridLines: {
									color: 'rgba(255,255,255,0.1)',
									lineWidth: 5,
								},
								ticks: {
									fontColor: 'rgba(255,255,255,1)',
									stepSize: [stepSize],
									callback: function(value:number) {
										return '$' + value;
									}
								}
							}]
						}
					}}
				/>
			</div>
		);
	}
}