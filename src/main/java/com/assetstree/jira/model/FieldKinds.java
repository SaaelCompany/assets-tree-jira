package com.assetstree.jira.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public final class FieldKinds {
    public static final String TEXT = "text";
    public static final String NUMBER = "number";
    public static final String USER = "user";
    public static final String TEXTAREA = "textarea";

    public static final Set<String> ALL = Collections.unmodifiableSet(new HashSet<String>(Arrays.asList(
            TEXT, NUMBER, USER, TEXTAREA
    )));

    private FieldKinds() {
    }

    public static boolean isKind(String kind) {
        return kind != null && ALL.contains(kind);
    }
}
