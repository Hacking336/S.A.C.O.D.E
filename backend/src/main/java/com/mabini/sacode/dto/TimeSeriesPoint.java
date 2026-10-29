package com.mabini.sacode.dto;

/**
 * One point on the "Reports Over Time" line chart.
 */
public record TimeSeriesPoint(String date, long submitted, long resolved) {
}
