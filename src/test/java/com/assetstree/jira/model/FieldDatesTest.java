package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class FieldDatesTest {
    @Test
    public void storesACalendarDay() {
        assertEquals("", FieldDates.canonical(null));
        assertEquals("", FieldDates.canonical("  "));
        assertEquals("2024-03-01", FieldDates.canonical("2024-03-01"));
        assertEquals("2024-03-01", FieldDates.canonical("1.3.2024"));
        assertEquals("2024-03-01", FieldDates.canonical("01.03.24"));
        assertEquals("1970-03-01", FieldDates.canonical("01.03.70"));
        assertEquals("2024-02-29", FieldDates.canonical("29.02.2024"));
        assertNull(FieldDates.canonical("31.02.2024"));
        assertNull(FieldDates.canonical("29.02.2023"));
        assertNull(FieldDates.canonical("вчера"));
        assertNull(FieldDates.canonical("1899-12-31"));
    }
}
