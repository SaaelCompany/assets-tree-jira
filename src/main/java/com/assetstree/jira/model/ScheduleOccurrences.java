package com.assetstree.jira.model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Dates of one repeating plan that fall inside a calendar month. */
public final class ScheduleOccurrences {
    private ScheduleOccurrences() {
    }

    public static List<LocalDate> inMonth(String lastDone, int count, String unit, int year, int month) {
        LocalDate first = ServiceDue.next(lastDone, count, unit);
        if (first == null || month < 1 || month > 12) {
            return Collections.emptyList();
        }
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        LocalDate cursor = jumpTo(first, count, unit, start);
        List<LocalDate> found = new ArrayList<LocalDate>();
        int guard = 0;
        while (cursor != null && !cursor.isAfter(end) && guard < 40) {
            if (!cursor.isBefore(start)) {
                found.add(cursor);
            }
            cursor = ServiceDue.next(cursor.toString(), count, unit);
            guard++;
        }
        return found;
    }

    private static LocalDate jumpTo(LocalDate first, int count, String unit, LocalDate start) {
        if (!first.isBefore(start)) {
            return first;
        }
        if (ServiceDue.DAY.equals(unit)) {
            long steps = ChronoUnit.DAYS.between(first, start) / count;
            LocalDate jumped = first.plusDays(steps * count);
            if (jumped.isBefore(start)) {
                jumped = jumped.plusDays(count);
            }
            return jumped;
        }
        long steps = ChronoUnit.MONTHS.between(first.withDayOfMonth(1), start.withDayOfMonth(1)) / count;
        LocalDate jumped = first.plusMonths(steps * count);
        int guard = 0;
        while (jumped.isBefore(start) && guard < 24) {
            jumped = jumped.plusMonths(count);
            guard++;
        }
        return jumped;
    }
}
