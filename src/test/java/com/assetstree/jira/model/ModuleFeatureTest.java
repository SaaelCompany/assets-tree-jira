package com.assetstree.jira.model;

import org.junit.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class ModuleFeatureTest {
    @Test
    public void monthKeepsOnlyTheDaysInsideIt() {
        List<LocalDate> days = ScheduleOccurrences.inMonth("2026-01-10", 10, "day", 2026, 3);
        assertEquals(LocalDate.of(2026, 3, 1), days.get(0));
        assertEquals(LocalDate.of(2026, 3, 31), days.get(days.size() - 1));
        assertEquals(4, days.size());
    }

    @Test
    public void straightLineStopsAtTheResidual() {
        assertEquals(1000L, Depreciation.monthlyMinor(13000L, 1000L, 12));
        assertEquals(1000L, Depreciation.bookMinor(13000L, 1000L, 12, 40));
        assertEquals(1, Depreciation.elapsedMonths(LocalDate.of(2026, 1, 15), LocalDate.of(2026, 3, 1)));
        assertTrue(Depreciation.warrantyActive(LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 1)));
        assertFalse(Depreciation.warrantyActive(LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 2)));
    }

    @Test
    public void moneyAndReportKeysRoundTrip() {
        assertEquals(Long.valueOf(150050L), MoneyText.parse("1 500,50"));
        assertEquals("1500.50", MoneyText.format(150050L));
        assertEquals("", WorkKind.clean("floor"));
        assertEquals(WorkKind.KTS, WorkKind.clean(" KTS "));
        assertEquals(4, ReportCatalog.savedId(ReportCatalog.savedKey(4)));
        assertTrue(ReportCatalog.isStandard(ReportCatalog.WARRANTY));
        assertEquals("", ReportCatalog.group("cost"));
    }
}
