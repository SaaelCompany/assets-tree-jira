package com.assetstree.jira.model;

import org.junit.Test;

import java.time.LocalDate;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class ServiceDueTest {
    @Test
    public void monthsStepFromTheLastService() {
        assertEquals(LocalDate.of(2026, 2, 15), ServiceDue.next("2026-01-15", 1, ServiceDue.MONTH));
        assertEquals(LocalDate.of(2026, 2, 28), ServiceDue.next("31.01.2026", 1, ServiceDue.MONTH));
        assertEquals(LocalDate.of(2024, 2, 29), ServiceDue.next("2024-01-31", 1, ServiceDue.MONTH));
        assertEquals(LocalDate.of(2026, 6, 1), ServiceDue.next("2026-03-01", 3, ServiceDue.MONTH));
        assertEquals(LocalDate.of(2027, 1, 1), ServiceDue.next("2026-01-01", 12, ServiceDue.MONTH));
    }

    @Test
    public void daysStepFromTheLastService() {
        assertEquals(LocalDate.of(2026, 2, 14), ServiceDue.next("2026-01-15", 30, ServiceDue.DAY));
    }

    @Test
    public void theDueDayCountsAsReached() {
        LocalDate next = LocalDate.of(2026, 10, 2);
        assertTrue(ServiceDue.reached(next, LocalDate.of(2026, 10, 2)));
        assertTrue(ServiceDue.reached(next, LocalDate.of(2026, 10, 3)));
        assertFalse(ServiceDue.reached(next, LocalDate.of(2026, 10, 1)));
        assertFalse(ServiceDue.reached(null, LocalDate.of(2026, 10, 2)));
    }

    @Test
    public void aBrokenScheduleHasNoNextDay() {
        assertNull(ServiceDue.next("", 1, ServiceDue.MONTH));
        assertNull(ServiceDue.next("2026-01-15", 0, ServiceDue.MONTH));
        assertNull(ServiceDue.next("2026-01-15", 1, "week"));
        assertNull(ServiceDue.next("2026-01-15", 121, ServiceDue.MONTH));
        assertNull(ServiceDue.next("2026-01-15", 3651, ServiceDue.DAY));
        assertEquals(LocalDate.of(2036, 1, 15), ServiceDue.next("2026-01-15", 120, ServiceDue.MONTH));
        assertEquals("", ServiceDue.unit(" weeks "));
        assertEquals(ServiceDue.MONTH, ServiceDue.unit(" Month "));
    }
}
