package com.assetstree.jira.model;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Rights stored on a project group. View is included whenever any other right is set.
 * Older rows keep a single level and expand to the same bundle they had before.
 */
public final class GrantCaps {
    public static final String VIEW = "view";
    public static final String CREATE = "create";
    public static final String EDIT = "edit";
    public static final String MOVE = "move";
    public static final String REMOVE = "remove";
    public static final String COMMENT = "comment";
    public static final String SCHEMA = "schema";
    public static final String ACCESS = "access";

    private static final String[] ORDER = new String[] {
            VIEW, CREATE, EDIT, MOVE, REMOVE, COMMENT, SCHEMA, ACCESS
    };

    private GrantCaps() {
    }

    public static String fromLevel(String level) {
        if ("manage".equals(level)) {
            return "view,create,edit,move,remove,comment,schema,access";
        }
        if ("edit".equals(level)) {
            return "view,create,edit,move,remove,comment";
        }
        if ("view".equals(level)) {
            return VIEW;
        }
        return "";
    }

    public static String normalize(String raw) {
        Set<String> chosen = new LinkedHashSet<String>();
        if (raw != null) {
            String[] parts = raw.split(",");
            for (int i = 0; i < parts.length; i++) {
                String token = parts[i] == null ? "" : parts[i].trim();
                if (allowed(token)) {
                    chosen.add(token);
                }
            }
        }
        if (chosen.isEmpty()) {
            return "";
        }
        if (chosen.contains(CREATE)) {
            chosen.add(REMOVE);
            chosen.add(COMMENT);
        }
        if (chosen.size() > 1 || !chosen.contains(VIEW)) {
            chosen.add(VIEW);
        }
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < ORDER.length; i++) {
            if (!chosen.contains(ORDER[i])) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(',');
            }
            builder.append(ORDER[i]);
        }
        return builder.toString();
    }

    public static boolean has(String caps, String cap) {
        if (caps == null || cap == null || cap.isEmpty()) {
            return false;
        }
        String[] parts = caps.split(",");
        boolean create = false;
        for (int i = 0; i < parts.length; i++) {
            String token = parts[i].trim();
            if (cap.equals(token)) {
                return true;
            }
            if (CREATE.equals(token)) {
                create = true;
            }
        }
        return create && (REMOVE.equals(cap) || COMMENT.equals(cap));
    }

    public static String levelOf(String caps) {
        if (has(caps, SCHEMA) || has(caps, ACCESS)) {
            return "manage";
        }
        if (has(caps, CREATE) || has(caps, EDIT) || has(caps, MOVE) || has(caps, REMOVE) || has(caps, COMMENT)) {
            return "edit";
        }
        return VIEW;
    }

    private static boolean allowed(String token) {
        for (int i = 0; i < ORDER.length; i++) {
            if (ORDER[i].equals(token)) {
                return true;
            }
        }
        return false;
    }
}
