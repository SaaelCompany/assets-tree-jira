package com.assetstree.jira.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Features still in testing. Each project turns them on separately; all are off by default.
 */
public final class Labs {
    public static final String SCHEDULE = "schedule";
    public static final String MAP = "map";
    public static final String REPORTS = "reports";
    public static final String LIFECYCLE = "lifecycle";
    public static final List<String> ALL = Collections.unmodifiableList(Arrays.asList(SCHEDULE, MAP, REPORTS, LIFECYCLE));

    /** Lifecycle data of one asset is stored under this document kind, keyed by the asset id. */
    public static final String LIFE_DOC = "life";
    public static final int MAX_BODY = 2000000;
    public static final int MAX_LIFE_BODY = 20000;

    public static final String PENDING = "pending";
    public static final String APPROVED = "approved";
    public static final String REJECTED = "rejected";
    public static final String CANCELLED = "cancelled";
    public static final int TEXT = 450;

    private Labs() {
    }

    public static List<String> clean(List<String> raw) {
        List<String> picked = new ArrayList<String>();
        if (raw == null) {
            return picked;
        }
        for (String lab : ALL) {
            for (String item : raw) {
                if (item != null && lab.equals(item.trim().toLowerCase(Locale.ROOT)) && !picked.contains(lab)) {
                    picked.add(lab);
                }
            }
        }
        return picked;
    }

    public static List<String> split(String stored) {
        if (stored == null || stored.trim().isEmpty()) {
            return new ArrayList<String>();
        }
        return clean(Arrays.asList(stored.split(",")));
    }

    public static String join(List<String> labs) {
        StringBuilder out = new StringBuilder();
        for (String lab : clean(labs)) {
            if (out.length() > 0) {
                out.append(',');
            }
            out.append(lab);
        }
        return out.toString();
    }

    /** The feature a project document belongs to, or null when the kind is not a project document. */
    public static String labOfDoc(String kind) {
        if (kind == null) {
            return null;
        }
        String clean = kind.trim().toLowerCase(Locale.ROOT);
        if (SCHEDULE.equals(clean) || MAP.equals(clean) || REPORTS.equals(clean)) {
            return clean;
        }
        return null;
    }

    public static String body(String raw, int limit) {
        String body = raw == null ? "" : raw.trim();
        if (body.isEmpty()) {
            return "{}";
        }
        if (body.length() > limit) {
            throw new AssetException(400, "asset-tree.error.lab.size");
        }
        if (!JsonCheck.isObject(body)) {
            throw new AssetException(400, "asset-tree.error.lab.body");
        }
        return body;
    }

    public static String text(String raw) {
        String value = raw == null ? "" : raw.trim();
        return value.length() > TEXT ? value.substring(0, TEXT) : value;
    }
}
