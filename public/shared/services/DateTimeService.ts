module Shared {
	export interface IDateTimeService {
		currentYear(): number;
		currentMonthValue(): number;
		currentMonthName(): string;
		lastMonthYear(): number;
		lastMonthValue(): number;
		lastMonthName(): string;
		monthName(monthValue: number): string;
		beautifyDate(date: Date): IPrettyDate;
	}

	export interface IPrettyDate {
		month: string;
		day: number;
		year: number;
		hour: number;
		minute: number;
		ampm: string;
	}
	
	export class DateTimeService implements IDateTimeService {
		
		private monthNames = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		
		constructor() {
		}

		public currentYear() {
			return new Date().getFullYear();
		}
		
		public currentMonthValue() {
			return new Date().getMonth();
		}
		
		public currentMonthName() {
			return this.monthNames[this.currentMonthValue()];
		}
		
		public lastMonthYear() {
			return (this.currentMonthValue() - 1 < 0) ? this.currentYear() - 1 : this.currentYear();
		}
		
		public lastMonthValue() {
			return (this.currentMonthValue() - 1 < 0) ? 11 : this.currentMonthValue() - 1;
		}
		
		public lastMonthName() {
			return this.monthNames[this.lastMonthValue()];
		}
		
		public monthName(monthValue: number) {
			if (monthValue >= 0 && monthValue <= 11) {
				return this.monthNames[monthValue];
			}

			return '';
		}

		public beautifyDate(date: Date): IPrettyDate {
			if(!date) {
				return {
					month: this.monthName(0),
					day: 1,
					year: 1970,
					hour: 12,
					minute: 0,
					ampm: "AM"
				};
			};

			var hour = date.getHours();
			return {
				month: this.monthName(date.getMonth()),
				day: date.getDate(),
				year: date.getFullYear(),
				hour: hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour),
				minute: date.getMinutes(),
				ampm: hour >= 12 ? "PM" : "AM"
			};
		}
	}
}
