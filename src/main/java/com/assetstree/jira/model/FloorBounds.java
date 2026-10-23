package com.assetstree.jira.model;

/** Pixel limits for a drawn floor: rooms and equipment pins share one canvas. */
public final class FloorBounds {
    public static final int CANVAS = 1000;
    public static final int CANVAS_HEIGHT = 640;
    public static final int MIN_ROOM = 36;
    public static final int MAX_FLOORS = 40;
    public static final int MAX_ROOMS = 80;
    public static final int MAX_PINS = 200;

    private FloorBounds() {
    }

    public static int clamp(int value, int max) {
        if (value < 0) {
            return 0;
        }
        return value > max ? max : value;
    }
}
