import React from 'react';

//Interfaces
import { IGraphData } from '../interfaces/IGraphData';
import { IGraphMilestoneData } from '../interfaces/IGraphMiletoneData';

//3rd party chart library
import { Line } from 'react-chartjs-2';

export const ChartConfigurations = [
	{
		option: '1 Week',
		period: 7,
		interval: 1,
		numOfLabels: 8
	},
	{
		option: '1 Month',
		period: 30,
		interval: 1,
		numOfLabels: 4
	},
	{
		option: '3 Months',
		period: 90,
		interval: 5,
		numOfLabels: 6
	},
	{
		option: '6 Months',
		period: 180,
		interval: 3,
		numOfLabels: 6
	},
	{
		option: '1 Year',
		period: 365,
		interval: 5,
		numOfLabels: 6
	},
	{
		option: '3 Years',
		period: 365*3,
		interval: 15,
		numOfLabels: 6
	},
	{
		option: '5 Years',
		period: 365*5,
		interval: 25,
		numOfLabels: 5
	}
]

interface IProps {
	data: IGraphData;
	milestones?: IGraphMilestoneData;
	configuration: number;
	color: string;
	units: string;
}

export class Chart extends React.Component<IProps> {

	getStepSize(numOfSteps: number) {
		var data = Object.values(this.props.data);

		if(data.length === 0)
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
		var minorRange = range - roundedRange

		var minorRoundedRange = 0;
		if(minorRange > 0) {
			magnitude = Math.pow(10, Math.floor(minorRange).toString().length - 1);
			minorRoundedRange = (Math.round(minorRange / magnitude) * magnitude);
		}

		if(roundedRange === 0) {
			return 1;
		}
		else {
			return (roundedRange + minorRoundedRange)/numOfSteps;
		}
	}

	getLabels() {
		var labels = [];
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

		var keys = Object.keys(this.props.data);

		var i: number;
		var date: Date;
		if(this.props.configuration === 0) { // 1 Week
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(days[date.getDay()]);
			}
		}
		else if(this.props.configuration === 1) {
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(date.getDate() + '-' + months[date.getMonth()])
			}
		}
		else if(this.props.configuration === 2) {
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(date.getDate() + '-' + months[date.getMonth()])
			}
		}
		else if(this.props.configuration === 3) {
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.configuration === 4) {
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.configuration === 5) {
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(months[date.getMonth()] + '-' + date.getFullYear())
			}
		}
		else if(this.props.configuration === 6) {
			for(i=0; i<keys.length; i++) {
				date = new Date(parseInt(keys[i]));
				labels.push(date.getFullYear())
			}
		}
		
		return labels;
	}

	render() {
		var stepSize = this.getStepSize(4);
		var labels = this.getLabels();

		var data = {};
		if(!this.props.milestones) {
			data = {
				labels: labels.reverse(),
				datasets: [{
					fill: false,
					backgroundColor: [this.props.color],
					borderColor: [this.props.color],
					data: Object.values(this.props.data).reverse()
				}]
			}
		}
		else {
			data = {
				labels: labels.reverse(),
				datasets: [{
					label: "milestones",
					fill: false,
					backgroundColor: "#FF6384",
					borderColor: "#FF6384",
					data: Object.values(this.props.milestones.data).reverse(),
					pointRadius: 5,
					pointHoverRadius: 10,
					showLine: false,
					milestoneLabels: this.props.milestones.labels.reverse()
				},{
					label: "data",
					fill: false,
					backgroundColor: [this.props.color],
					borderColor: [this.props.color],
					data: Object.values(this.props.data).reverse(),
					type: 'line'
				}]
			}
		}

		return (
			<div className="dashboard-chart">
				<Line
					data={data}
					options={{
						maintainAspectRatio: false,
						responsive: true,
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
									fontColor: 'rgba(255,255,255,1)',
									maxTicksLimit: ChartConfigurations[this.props.configuration].numOfLabels
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
									callback: (value:number) => {
										if(this.props.units === '$') {
											return '$' + value;
										} else if(this.props.units === '%') {
											return value + '%';
										} else {
											return value;
										}
									}
								}
							}]
						},
						tooltips: {
							callbacks: {
								label: (t: any, d: any) => {
									let milestoneLabel = "";
									if(d.datasets[t.datasetIndex].milestoneLabels) {
										if(t.index < d.datasets[t.datasetIndex].milestoneLabels.length) {
											milestoneLabel = d.datasets[t.datasetIndex].milestoneLabels[t.index];
										}
									}

									if(milestoneLabel) {
										return milestoneLabel;
									}
									else {
										let yLabel: string;
										if(this.props.units === '$') {
											yLabel = t.yLabel >= 1000 ? '$' + t.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '$' + t.yLabel;
										}
										else if(this.props.units === '%') {
											yLabel = t.yLabel.toFixed(2) + '%';
										}
										else {
											yLabel = t.yLabel;
										}
										return yLabel;
									}
								}
							}
						},
					}}
				/>
			</div>
		);
	}
}