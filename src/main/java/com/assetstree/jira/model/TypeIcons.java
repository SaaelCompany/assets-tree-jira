package com.assetstree.jira.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Icon keys a type can carry. The glyphs themselves live in the page script;
 * the server only stores and validates the key so old rows and unknown values
 * fall back to a sensible default.
 */
public final class TypeIcons {
    public static final String DEFAULT_PLACE = "building";
    public static final String DEFAULT_OBJECT = "device";

    public static final List<String> ALL = Collections.unmodifiableList(Arrays.asList(
            "building", "warehouse", "department", "office", "hospital", "factory", "store", "home",
            "device", "desktop", "laptop", "monitor", "server", "printer", "scanner", "phone", "tablet",
            "camera", "network", "wifi", "storage", "keyboard", "projector", "battery",
            "medical", "microscope", "tool", "vehicle", "furniture", "box", "document", "tag",
            "project", "megaphone", "target", "bars", "headset", "users", "chat", "clipboard",
            "gear", "badge", "syringe", "pill", "pulse", "code", "window"
    ));

    private TypeIcons() {
    }

    public static boolean isIcon(String icon) {
        return icon != null && ALL.contains(icon);
    }

    public static String defaultFor(boolean location) {
        return location ? DEFAULT_PLACE : DEFAULT_OBJECT;
    }

    /** Returns the stored key when it is known, otherwise the default for the kind of type. */
    public static String resolve(String stored, boolean location) {
        String key = stored == null ? "" : stored.trim().toLowerCase(Locale.ROOT);
        return isIcon(key) ? key : defaultFor(location);
    }
}
