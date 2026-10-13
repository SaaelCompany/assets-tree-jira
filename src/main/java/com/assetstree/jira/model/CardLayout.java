package com.assetstree.jira.model;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * What a project's printed equipment card shows, and how the sticker is arranged.
 */
@XmlAccessorType(XmlAccessType.PROPERTY)
public class CardLayout {
    public static final int MAX_LINES = 12;
    public static final String SIZE_CARD = "card";
    public static final String SIZE_WIDE = "wide";
    public static final String SIZE_LABEL = "label";
    public static final String QR_LEFT = "left";
    public static final String QR_RIGHT = "right";
    public static final String QR_TOP = "top";
    public static final String QR_NONE = "none";

    private static final Pattern ATTR = Pattern.compile("^attr:[a-z][a-z0-9-]{0,39}$");
    private static final Set<String> SIZES = new HashSet<String>(Arrays.asList(SIZE_CARD, SIZE_WIDE, SIZE_LABEL));
    private static final Set<String> QRS = new HashSet<String>(Arrays.asList(QR_LEFT, QR_RIGHT, QR_TOP, QR_NONE));
    private static final Set<String> BLOCKS = new LinkedHashSet<String>(Arrays.asList(
            "name", "key", "type", "place", "status", "custodian", "project", "description", "scan"));

    private String size;
    private String qr;
    private List<String> lines;

    public static CardLayout defaults() {
        CardLayout layout = new CardLayout();
        layout.size = SIZE_CARD;
        layout.qr = QR_LEFT;
        layout.lines = new ArrayList<String>(Arrays.asList("name", "type", "place", "key", "scan"));
        return layout;
    }

    public static CardLayout normalize(CardLayout raw) {
        CardLayout layout = defaults();
        if (raw == null) {
            return layout;
        }
        String size = token(raw.size);
        if (SIZES.contains(size)) {
            layout.size = size;
        }
        String qr = token(raw.qr);
        if (QRS.contains(qr)) {
            layout.qr = qr;
        }
        if (raw.lines != null) {
            List<String> next = new ArrayList<String>();
            Set<String> seen = new HashSet<String>();
            for (String line : raw.lines) {
                String trimmed = line == null ? "" : line.trim();
                if (trimmed.isEmpty()) {
                    continue;
                }
                String lower = trimmed.toLowerCase(Locale.ROOT);
                String token = BLOCKS.contains(lower) ? lower : trimmed;
                if (!seen.add(token)) {
                    continue;
                }
                if (!BLOCKS.contains(token) && !ATTR.matcher(token).matches()) {
                    continue;
                }
                next.add(token);
                if (next.size() >= MAX_LINES) {
                    break;
                }
            }
            layout.lines = next;
        }
        return layout;
    }

    public static String join(List<String> lines) {
        if (lines == null || lines.isEmpty()) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        for (String line : lines) {
            if (builder.length() > 0) {
                builder.append('\n');
            }
            builder.append(line);
        }
        return builder.toString();
    }

    public static List<String> split(String raw) {
        List<String> lines = new ArrayList<String>();
        if (raw == null || raw.isEmpty()) {
            return lines;
        }
        for (String part : raw.split("\n")) {
            if (!part.trim().isEmpty()) {
                lines.add(part.trim());
            }
        }
        return lines;
    }

    public static Set<String> blocks() {
        return Collections.unmodifiableSet(BLOCKS);
    }

    private static String token(String raw) {
        return raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getQr() {
        return qr;
    }

    public void setQr(String qr) {
        this.qr = qr;
    }

    public List<String> getLines() {
        return lines;
    }

    public void setLines(List<String> lines) {
        this.lines = lines;
    }
}
