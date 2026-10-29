package com.mabini.sacode.dto;

/**
 * Generic {name, value} slice used by the donut and ranked-bar charts.
 */
public record NameValue(String name, long value, String percent) {

    public NameValue(String name, long value) {
        this(name, value, null);
    }
}
