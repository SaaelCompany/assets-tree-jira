package com.assetstree.jira.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * What the customer portal shows about each item a customer holds. The name and the
 * role (custodian or a user field) are always shown; the rest is picked per project.
 * Nothing saved means the built-in set.
 */
public final class PortalCard {
    public static final List<String> DEFAULT_FIELDS = Collections.unmodifiableList(Arrays.asList(
            "key", "type", "status", "location"));

    private PortalCard() {
    }

    public static List<String> clean(List<String> raw) {
        List<String> picked = new ArrayList<String>();
        for (String key : ViewColumns.clean(raw)) {
            if (!"custodian".equals(key)) {
                picked.add(key);
            }
        }
        return picked;
    }

    /** Stored keys, or the built-in set when nothing was saved yet. */
    public static List<String> effective(String stored) {
        List<String> keys = new ArrayList<String>();
        for (String key : ViewColumns.split(stored)) {
            if (!"custodian".equals(key)) {
                keys.add(key);
            }
        }
        return keys.isEmpty() ? new ArrayList<String>(DEFAULT_FIELDS) : keys;
    }

    /** Fields are matched by name, so one choice covers the same field in every type. */
    public static boolean sameField(String left, String right) {
        String a = left == null ? "" : left.trim().toLowerCase(Locale.ROOT);
        String b = right == null ? "" : right.trim().toLowerCase(Locale.ROOT);
        return !a.isEmpty() && a.equals(b);
    }
}
