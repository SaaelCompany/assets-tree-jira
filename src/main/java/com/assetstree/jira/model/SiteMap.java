package com.assetstree.jira.model;

import com.assetstree.jira.dto.SiteBuildingDto;
import com.assetstree.jira.dto.SiteMapDto;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * A project site plan. Buildings keep the coordinates and rotation they were given:
 * nothing here pulls them onto a vertical or horizontal lattice.
 */
public final class SiteMap {
    public static final String RECT = "rect";
    public static final String L = "l";
    public static final String U = "u";
    public static final String T = "t";
    public static final String CROSS = "cross";
    public static final String CIRCLE = "circle";
    public static final String HEX = "hex";
    public static final String TOWER = "tower";
    public static final String HANGAR = "hangar";
    public static final String POLY = "poly";

    private static final int MAX_BUILDINGS = 200;
    private static final int MAX_POINTS = 12;
    private static final Pattern COLOR = Pattern.compile("#[0-9A-Fa-f]{6}");

    private SiteMap() {
    }

    public static final class Building {
        private int assetId;
        private String shape = RECT;
        private double x;
        private double y;
        private double w = 160;
        private double h = 110;
        private int rotation;
        private String color = "";
        private int floors = 1;
        private int opacity = 100;
        private String label = "";
        private String note = "";
        private String points = "";
        private boolean hidden;

        public int getAssetId() {
            return assetId;
        }

        public void setAssetId(int assetId) {
            this.assetId = assetId;
        }

        public String getShape() {
            return shape;
        }

        public void setShape(String shape) {
            this.shape = shape;
        }

        public double getX() {
            return x;
        }

        public void setX(double x) {
            this.x = x;
        }

        public double getY() {
            return y;
        }

        public void setY(double y) {
            this.y = y;
        }

        public double getW() {
            return w;
        }

        public void setW(double w) {
            this.w = w;
        }

        public double getH() {
            return h;
        }

        public void setH(double h) {
            this.h = h;
        }

        public int getRotation() {
            return rotation;
        }

        public void setRotation(int rotation) {
            this.rotation = rotation;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public int getFloors() {
            return floors;
        }

        public void setFloors(int floors) {
            this.floors = floors;
        }

        public int getOpacity() {
            return opacity;
        }

        public void setOpacity(int opacity) {
            this.opacity = opacity;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }

        public String getPoints() {
            return points;
        }

        public void setPoints(String points) {
            this.points = points;
        }

        public boolean isHidden() {
            return hidden;
        }

        public void setHidden(boolean hidden) {
            this.hidden = hidden;
        }
    }

    public static final class Canvas {
        private int snap;
        private boolean showGrid;
        private String background = "#F4F5F7";
        private boolean showLabels = true;
        private boolean showFloors = true;
        private boolean showCount = true;
        private final List<Building> buildings = new ArrayList<Building>();

        public int getSnap() {
            return snap;
        }

        public void setSnap(int snap) {
            this.snap = snap;
        }

        public boolean isShowGrid() {
            return showGrid;
        }

        public void setShowGrid(boolean showGrid) {
            this.showGrid = showGrid;
        }

        public String getBackground() {
            return background;
        }

        public void setBackground(String background) {
            this.background = background;
        }

        public boolean isShowLabels() {
            return showLabels;
        }

        public void setShowLabels(boolean showLabels) {
            this.showLabels = showLabels;
        }

        public boolean isShowFloors() {
            return showFloors;
        }

        public void setShowFloors(boolean showFloors) {
            this.showFloors = showFloors;
        }

        public boolean isShowCount() {
            return showCount;
        }

        public void setShowCount(boolean showCount) {
            this.showCount = showCount;
        }

        public List<Building> getBuildings() {
            return buildings;
        }
    }

    public static Canvas normalize(Canvas raw) {
        Canvas canvas = new Canvas();
        if (raw == null) {
            return canvas;
        }
        canvas.setSnap(snapOf(raw.getSnap()));
        canvas.setShowGrid(raw.isShowGrid());
        canvas.setBackground(colorOf(raw.getBackground(), "#F4F5F7"));
        canvas.setShowLabels(raw.isShowLabels());
        canvas.setShowFloors(raw.isShowFloors());
        canvas.setShowCount(raw.isShowCount());
        Map<Integer, Building> seen = new LinkedHashMap<Integer, Building>();
        for (Building building : raw.getBuildings()) {
            Building clean = clean(building);
            if (clean == null) {
                continue;
            }
            seen.put(Integer.valueOf(clean.getAssetId()), clean);
            if (seen.size() >= MAX_BUILDINGS) {
                break;
            }
        }
        canvas.getBuildings().addAll(seen.values());
        return canvas;
    }

    public static Canvas fromDto(SiteMapDto dto) {
        Canvas canvas = new Canvas();
        if (dto == null) {
            return canvas;
        }
        canvas.setSnap(dto.getSnap());
        canvas.setShowGrid(dto.isShowGrid());
        canvas.setBackground(dto.getBackground());
        canvas.setShowLabels(dto.isShowLabels());
        canvas.setShowFloors(dto.isShowFloors());
        canvas.setShowCount(dto.isShowCount());
        if (dto.getBuildings() != null) {
            for (SiteBuildingDto item : dto.getBuildings()) {
                if (item == null) {
                    continue;
                }
                Building building = new Building();
                building.setAssetId(item.getAssetId());
                building.setShape(item.getShape());
                building.setX(item.getX());
                building.setY(item.getY());
                building.setW(item.getW());
                building.setH(item.getH());
                building.setRotation(item.getRotation());
                building.setColor(item.getColor());
                building.setFloors(item.getFloors());
                building.setOpacity(item.getOpacity());
                building.setLabel(item.getLabel());
                building.setNote(item.getNote());
                building.setPoints(item.getPoints());
                building.setHidden(item.isHidden());
                canvas.getBuildings().add(building);
            }
        }
        return canvas;
    }

    public static SiteMapDto toDto(Canvas canvas) {
        Canvas clean = normalize(canvas);
        SiteMapDto dto = new SiteMapDto();
        dto.setSnap(clean.getSnap());
        dto.setShowGrid(clean.isShowGrid());
        dto.setBackground(clean.getBackground());
        dto.setShowLabels(clean.isShowLabels());
        dto.setShowFloors(clean.isShowFloors());
        dto.setShowCount(clean.isShowCount());
        List<SiteBuildingDto> buildings = new ArrayList<SiteBuildingDto>();
        for (Building building : clean.getBuildings()) {
            SiteBuildingDto item = new SiteBuildingDto();
            item.setAssetId(building.getAssetId());
            item.setShape(building.getShape());
            item.setX(building.getX());
            item.setY(building.getY());
            item.setW(building.getW());
            item.setH(building.getH());
            item.setRotation(building.getRotation());
            item.setColor(building.getColor());
            item.setFloors(building.getFloors());
            item.setOpacity(building.getOpacity());
            item.setLabel(building.getLabel());
            item.setNote(building.getNote());
            item.setPoints(building.getPoints());
            item.setHidden(building.isHidden());
            buildings.add(item);
        }
        dto.setBuildings(buildings);
        return dto;
    }

    public static String write(Canvas canvas) {
        Canvas clean = normalize(canvas);
        StringBuilder out = new StringBuilder();
        out.append("{\"snap\":").append(clean.getSnap());
        out.append(",\"showGrid\":").append(clean.isShowGrid() ? "true" : "false");
        out.append(",\"background\":");
        FlowGraph.quote(out, clean.getBackground());
        out.append(",\"showLabels\":").append(clean.isShowLabels() ? "true" : "false");
        out.append(",\"showFloors\":").append(clean.isShowFloors() ? "true" : "false");
        out.append(",\"showCount\":").append(clean.isShowCount() ? "true" : "false");
        out.append(",\"buildings\":[");
        List<Building> buildings = clean.getBuildings();
        for (int i = 0; i < buildings.size(); i++) {
            if (i > 0) {
                out.append(',');
            }
            writeBuilding(out, buildings.get(i));
        }
        out.append("]}");
        return out.toString();
    }

    public static Canvas read(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return normalize(null);
        }
        Object parsed = CardCanvas.parse(raw.trim());
        if (!(parsed instanceof Map)) {
            return normalize(null);
        }
        return normalize(canvasOf((Map<?, ?>) parsed));
    }

    public static boolean knownShape(String shape) {
        return shapeKey(shape) != null;
    }

    private static void writeBuilding(StringBuilder out, Building building) {
        out.append("{\"assetId\":").append(building.getAssetId());
        out.append(",\"shape\":");
        FlowGraph.quote(out, building.getShape());
        out.append(",\"x\":").append(number(building.getX()));
        out.append(",\"y\":").append(number(building.getY()));
        out.append(",\"w\":").append(number(building.getW()));
        out.append(",\"h\":").append(number(building.getH()));
        out.append(",\"rotation\":").append(building.getRotation());
        out.append(",\"color\":");
        FlowGraph.quote(out, building.getColor());
        out.append(",\"floors\":").append(building.getFloors());
        out.append(",\"opacity\":").append(building.getOpacity());
        out.append(",\"label\":");
        FlowGraph.quote(out, building.getLabel());
        out.append(",\"note\":");
        FlowGraph.quote(out, building.getNote());
        out.append(",\"points\":");
        FlowGraph.quote(out, building.getPoints());
        out.append(",\"hidden\":").append(building.isHidden() ? "true" : "false");
        out.append('}');
    }

    private static Canvas canvasOf(Map<?, ?> map) {
        Canvas canvas = new Canvas();
        canvas.setSnap(whole(map.get("snap"), 32));
        canvas.setShowGrid(flag(map.get("showGrid"), false));
        canvas.setBackground(text(map.get("background")));
        canvas.setShowLabels(flag(map.get("showLabels"), true));
        canvas.setShowFloors(flag(map.get("showFloors"), true));
        canvas.setShowCount(flag(map.get("showCount"), true));
        Object buildings = map.get("buildings");
        if (buildings instanceof List) {
            for (Object item : (List<?>) buildings) {
                if (item instanceof Map) {
                    canvas.getBuildings().add(buildingOf((Map<?, ?>) item));
                }
            }
        }
        return canvas;
    }

    private static Building buildingOf(Map<?, ?> map) {
        Building building = new Building();
        building.setAssetId(whole(map.get("assetId"), Integer.MAX_VALUE));
        building.setShape(text(map.get("shape")));
        building.setX(real(map.get("x")));
        building.setY(real(map.get("y")));
        building.setW(real(map.get("w")));
        building.setH(real(map.get("h")));
        building.setRotation(whole(map.get("rotation"), 359));
        building.setColor(text(map.get("color")));
        building.setFloors(whole(map.get("floors"), 40));
        building.setOpacity(whole(map.get("opacity"), 100));
        building.setLabel(text(map.get("label")));
        building.setNote(text(map.get("note")));
        building.setPoints(text(map.get("points")));
        building.setHidden(flag(map.get("hidden"), false));
        return building;
    }

    private static Building clean(Building building) {
        if (building == null || building.getAssetId() <= 0) {
            return null;
        }
        Building clean = new Building();
        clean.setAssetId(building.getAssetId());
        String shape = shapeKey(building.getShape());
        String points = pointsOf(building.getPoints());
        if (POLY.equals(shape) && points.isEmpty()) {
            shape = RECT;
        }
        if (shape == null) {
            shape = RECT;
        }
        clean.setShape(shape);
        clean.setX(coord(building.getX()));
        clean.setY(coord(building.getY()));
        clean.setW(size(building.getW(), 160));
        clean.setH(size(building.getH(), 110));
        int rotation = building.getRotation() % 360;
        if (rotation < 0) {
            rotation += 360;
        }
        clean.setRotation(rotation);
        clean.setColor(colorOf(building.getColor(), ""));
        int floors = building.getFloors();
        if (floors < 1) {
            floors = 1;
        }
        if (floors > 40) {
            floors = 40;
        }
        clean.setFloors(floors);
        int opacity = building.getOpacity();
        if (opacity < 30) {
            opacity = building.getOpacity() == 0 ? 100 : 30;
        }
        if (opacity > 100) {
            opacity = 100;
        }
        clean.setOpacity(opacity);
        clean.setLabel(clip(building.getLabel(), 80));
        clean.setNote(clip(building.getNote(), 240));
        clean.setPoints(POLY.equals(shape) ? points : "");
        clean.setHidden(building.isHidden());
        return clean;
    }

    private static String shapeKey(String shape) {
        if (shape == null) {
            return null;
        }
        String key = shape.trim().toLowerCase(Locale.ROOT);
        if (RECT.equals(key) || L.equals(key) || U.equals(key) || T.equals(key) || CROSS.equals(key)
                || CIRCLE.equals(key) || HEX.equals(key) || TOWER.equals(key) || HANGAR.equals(key) || POLY.equals(key)) {
            return key;
        }
        return null;
    }

    /** Keeps a free-form outline. Fewer than three corners is not an outline. */
    private static String pointsOf(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return "";
        }
        String[] parts = raw.split(";");
        StringBuilder out = new StringBuilder();
        int count = 0;
        for (String part : parts) {
            String[] pair = part.split(",");
            if (pair.length != 2) {
                continue;
            }
            Double x = unit(pair[0]);
            Double y = unit(pair[1]);
            if (x == null || y == null) {
                continue;
            }
            if (count > 0) {
                out.append(';');
            }
            out.append(number(x.doubleValue())).append(',').append(number(y.doubleValue()));
            count++;
            if (count >= MAX_POINTS) {
                break;
            }
        }
        return count >= 3 ? out.toString() : "";
    }

    private static Double unit(String raw) {
        try {
            double value = Double.parseDouble(raw.trim());
            if (value < 0) {
                value = 0;
            }
            if (value > 100) {
                value = 100;
            }
            return Double.valueOf(Math.round(value * 10d) / 10d);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static int snapOf(int snap) {
        if (snap == 8 || snap == 16 || snap == 32) {
            return snap;
        }
        return 0;
    }

    private static double coord(double value) {
        if (Double.isNaN(value) || value < 0) {
            return 0;
        }
        if (value > 8000) {
            return 8000;
        }
        return Math.round(value * 10d) / 10d;
    }

    private static double size(double value, double fallback) {
        if (Double.isNaN(value) || value <= 0) {
            return fallback;
        }
        if (value < 48) {
            return 48;
        }
        if (value > 800) {
            return 800;
        }
        return Math.round(value * 10d) / 10d;
    }

    private static String colorOf(String raw, String fallback) {
        if (raw == null) {
            return fallback;
        }
        String text = raw.trim();
        if (!COLOR.matcher(text).matches()) {
            return fallback;
        }
        return text.toUpperCase(Locale.ROOT);
    }

    private static String clip(String value, int max) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() > max) {
            return trimmed.substring(0, max);
        }
        return trimmed;
    }

    private static String number(double value) {
        double rounded = Math.round(value * 10d) / 10d;
        if (rounded == Math.rint(rounded)) {
            return String.valueOf((long) rounded);
        }
        return String.format(Locale.US, "%.1f", Double.valueOf(rounded));
    }

    private static boolean flag(Object value, boolean fallback) {
        return value instanceof Boolean ? ((Boolean) value).booleanValue() : fallback;
    }

    private static int whole(Object value, int max) {
        if (!(value instanceof Number)) {
            return 0;
        }
        int number = (int) Math.round(((Number) value).doubleValue());
        if (number < 0) {
            return 0;
        }
        return Math.min(number, max);
    }

    private static double real(Object value) {
        return value instanceof Number ? ((Number) value).doubleValue() : 0;
    }

    private static String text(Object value) {
        return value instanceof String ? (String) value : "";
    }
}
