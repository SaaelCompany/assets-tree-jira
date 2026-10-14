package com.assetstree.jira.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The request field walks a place, then the equipment type, then a subtype, then the device.
 * A subtype group exists only where that subtype has equipment. A place stays a real asset.
 */
public final class PickerLayout {
    private PickerLayout() {
    }

    public static final class Source {
        private final int id;
        private final Integer parentId;
        private final String name;
        private final String objectKey;
        private final String status;
        private final String typeKey;
        private final String typeLabel;
        private final String parentTypeKey;
        private final String parentTypeLabel;
        private final boolean location;

        public Source(int id, Integer parentId, String name, String objectKey, String status,
                      String typeKey, String typeLabel, String parentTypeKey, String parentTypeLabel, boolean location) {
            this.id = id;
            this.parentId = parentId;
            this.name = name == null ? "" : name;
            this.objectKey = objectKey == null ? "" : objectKey;
            this.status = status == null ? "" : status;
            this.typeKey = typeKey == null ? "" : typeKey;
            this.typeLabel = typeLabel == null || typeLabel.isEmpty() ? this.typeKey : typeLabel;
            this.parentTypeKey = parentTypeKey == null ? "" : parentTypeKey.trim();
            this.parentTypeLabel = parentTypeLabel == null || parentTypeLabel.isEmpty() ? this.parentTypeKey : parentTypeLabel;
            this.location = location;
        }

        public int getId() {
            return id;
        }

        public boolean isLocation() {
            return location;
        }
    }

    public static final class Node {
        private final int id;
        private final Integer parentId;
        private final String name;
        private final String objectKey;
        private final String typeLabel;
        private final String status;
        private final boolean group;

        private Node(int id, Integer parentId, String name, String objectKey, String typeLabel, String status, boolean group) {
            this.id = id;
            this.parentId = parentId;
            this.name = name;
            this.objectKey = objectKey == null ? "" : objectKey;
            this.typeLabel = typeLabel == null ? "" : typeLabel;
            this.status = status == null ? "" : status;
            this.group = group;
        }

        public int getId() {
            return id;
        }

        public Integer getParentId() {
            return parentId;
        }

        public String getName() {
            return name;
        }

        public String getObjectKey() {
            return objectKey;
        }

        public String getTypeLabel() {
            return typeLabel;
        }

        public String getStatus() {
            return status;
        }

        public boolean isGroup() {
            return group;
        }
    }

    public static List<Node> arrange(List<Source> sources) {
        List<Node> nodes = new ArrayList<Node>();
        if (sources == null || sources.isEmpty()) {
            return nodes;
        }
        Map<Integer, List<Source>> equipmentByPlace = new LinkedHashMap<Integer, List<Source>>();
        for (Source source : sources) {
            if (source == null || source.location || source.parentId == null) {
                continue;
            }
            List<Source> bucket = equipmentByPlace.get(source.parentId);
            if (bucket == null) {
                bucket = new ArrayList<Source>();
                equipmentByPlace.put(source.parentId, bucket);
            }
            bucket.add(source);
        }
        int[] nextGroup = new int[] { -1 };
        List<Integer> placed = new ArrayList<Integer>();
        for (Source source : sources) {
            if (source == null || !source.location) {
                continue;
            }
            nodes.add(asset(source, source.parentId));
            List<Source> gear = equipmentByPlace.get(Integer.valueOf(source.id));
            if (gear == null) {
                continue;
            }
            appendGroups(nodes, source.id, gear, nextGroup, placed);
        }
        for (Source source : sources) {
            if (source == null || source.location || placed.contains(Integer.valueOf(source.id))) {
                continue;
            }
            nodes.add(asset(source, source.parentId));
        }
        return nodes;
    }

    private static void appendGroups(List<Node> nodes, int placeId, List<Source> gear, int[] nextGroup, List<Integer> placed) {
        Map<String, List<Source>> byRoot = new LinkedHashMap<String, List<Source>>();
        for (Source item : gear) {
            String root = item.parentTypeKey.isEmpty() ? item.typeKey : item.parentTypeKey;
            List<Source> bucket = byRoot.get(root);
            if (bucket == null) {
                bucket = new ArrayList<Source>();
                byRoot.put(root, bucket);
            }
            bucket.add(item);
        }
        for (Map.Entry<String, List<Source>> entry : byRoot.entrySet()) {
            List<Source> items = entry.getValue();
            String rootLabel = rootLabel(entry.getKey(), items);
            int rootId = nextGroup[0];
            nextGroup[0] = rootId - 1;
            nodes.add(group(rootId, Integer.valueOf(placeId), rootLabel));
            List<Source> direct = new ArrayList<Source>();
            Map<String, List<Source>> bySubtype = new LinkedHashMap<String, List<Source>>();
            for (Source item : items) {
                if (item.parentTypeKey.isEmpty()) {
                    direct.add(item);
                    continue;
                }
                List<Source> bucket = bySubtype.get(item.typeKey);
                if (bucket == null) {
                    bucket = new ArrayList<Source>();
                    bySubtype.put(item.typeKey, bucket);
                }
                bucket.add(item);
            }
            for (Source item : direct) {
                nodes.add(asset(item, Integer.valueOf(rootId)));
                placed.add(Integer.valueOf(item.id));
            }
            for (Map.Entry<String, List<Source>> subtype : bySubtype.entrySet()) {
                List<Source> children = subtype.getValue();
                int subtypeId = nextGroup[0];
                nextGroup[0] = subtypeId - 1;
                nodes.add(group(subtypeId, Integer.valueOf(rootId), children.get(0).typeLabel));
                for (Source item : children) {
                    nodes.add(asset(item, Integer.valueOf(subtypeId)));
                    placed.add(Integer.valueOf(item.id));
                }
            }
        }
    }

    private static String rootLabel(String rootKey, List<Source> items) {
        for (Source item : items) {
            if (!item.parentTypeKey.isEmpty()) {
                return item.parentTypeLabel.isEmpty() ? rootKey : item.parentTypeLabel;
            }
        }
        return items.get(0).typeLabel.isEmpty() ? rootKey : items.get(0).typeLabel;
    }

    private static Node asset(Source source, Integer parentId) {
        return new Node(source.id, parentId, source.name, source.objectKey, source.typeLabel, source.status, false);
    }

    private static Node group(int id, Integer parentId, String label) {
        return new Node(id, parentId, label, "", label, "", true);
    }
}
