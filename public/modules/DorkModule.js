var DorkModule = angular.module('DorkModule', ['PlayerNametagModule', 'PlayerScoretagModule', 'DatePickerModule', 'MonthYearPickerModule']);

DorkModule.factory('monthYearQueryFactory', MonthYearQueryFactory);
DorkModule.factory('playerNameFactory', PlayerNameFactory);
DorkModule.directive('numericUpDown', NumericUpDownDirective);