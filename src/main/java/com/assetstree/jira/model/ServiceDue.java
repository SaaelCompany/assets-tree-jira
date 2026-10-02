package com.assetstree.jira.model;

import java.time.LocalDate;
import java.util.Locale;

/** Next calendar day for a repeating service such as maintenance or verification. */
public final class ServiceDue {
    public static final String DAY = "day";
    public static final String MONTH = "month";
    public static final int MAX_DAYS = 3650;
    public static final int MAX_MONTHS = 120;

    private ServiceDue() {
    }

    public static String unit(String raw) {
        if (raw == null) {
            return "";
        }
        String value = raw.trim().toLowerCase(Locale.ROOT);
        if (DAY.equals(value) || MONTH.equals(value)) {
            return value;
        }
        return "";
    }

    public static boolean countAllowed(int count, String unit) {
        if (DAY.equals(unit)) {
            return count >= 1 && count <= MAX_DAYS;
        }
        if (MONTH.equals(unit)) {
            return count >= 1 && count <= MAX_MONTHS;
        }
        return false;
    }

    /** The day the service is due again, or null when the schedule cannot be read. */
    public static LocalDate next(String lastDone, int count, String unit) {
        String iso = FieldDates.canonical(lastDone);
        if (iso == null || iso.isEmpty() || !countAllowed(count, unit)) {
            return null;
        }
        LocalDate last = LocalDate.parse(iso);
        if (DAY.equals(unit)) {
            return last.plusDays(count);
        }
        return last.plusMonths(count);
    }

    public static boolean reached(LocalDate next, LocalDate today) {
        return next != null && today != null && !next.isAfter(today);
    }
}
