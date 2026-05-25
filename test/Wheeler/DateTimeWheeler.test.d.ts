/**
 * Demonstrates basic DateTimeWheeler with default datetime mode
 */
declare const BasicDateTimeWheeler: () => import("woby").Child;
/**
 * Demonstrates DateTimeWheeler with date mode (year, month, day only)
 */
declare const DateOnlyWheeler: () => import("woby").Child;
/**
 * Demonstrates DateTimeWheeler with time mode (hour, minute, second only)
 */
declare const TimeOnlyWheeler: () => import("woby").Child;
/**
 * Demonstrates DateTimeWheeler with minDate and maxDate constraints
 */
declare const ConstrainedDateTimeWheeler: () => import("woby").Child;
/**
 * Demonstrates DateTimeWheeler with custom year range
 */
declare const CustomYearRangeWheeler: () => import("woby").Child;
/**
 * Demonstrates DateTimeWheeler with custom item count
 */
declare const CustomItemCountWheeler: () => import("woby").Child;
export { BasicDateTimeWheeler, DateOnlyWheeler, TimeOnlyWheeler, ConstrainedDateTimeWheeler, CustomYearRangeWheeler, CustomItemCountWheeler };
