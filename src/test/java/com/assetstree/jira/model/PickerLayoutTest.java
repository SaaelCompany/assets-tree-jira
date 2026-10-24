package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class PickerLayoutTest {
    @Test
    public void equipmentSitsUnderItsTypeAndSubtypeAtThatPlaceOnly() {
        List<PickerLayout.Node> nodes = PickerLayout.arrange(Arrays.asList(
                place(1, null, "Филиал Усть-Лабинск"),
                place(2, 1, "Отделение"),
                gear(3, 1, "HP LaserJet", "mfu", "МФУ", "org", "Оргтехника"),
                gear(4, 1, "Canon", "printers", "Принтеры", "org", "Оргтехника"),
                gear(5, 2, "Ноутбук 1", "laptop", "Ноутбук", "", "")));

        PickerLayout.Node org = groupNamed(nodes, "Оргтехника");
        PickerLayout.Node mfu = groupNamed(nodes, "МФУ");
        PickerLayout.Node printers = groupNamed(nodes, "Принтеры");
        PickerLayout.Node laptop = groupNamed(nodes, "Ноутбук");
        assertEquals(Integer.valueOf(1), org.getParentId());
        assertEquals(Integer.valueOf(org.getId()), mfu.getParentId());
        assertEquals(Integer.valueOf(org.getId()), printers.getParentId());
        assertEquals(Integer.valueOf(mfu.getId()), node(nodes, 3).getParentId());
        assertEquals(Integer.valueOf(printers.getId()), node(nodes, 4).getParentId());
        assertEquals(Integer.valueOf(2), laptop.getParentId());
        assertEquals(Integer.valueOf(laptop.getId()), node(nodes, 5).getParentId());
        assertTrue(org.getId() < 0);
        assertFalse(node(nodes, 2).isGroup());
        assertEquals(Integer.valueOf(1), node(nodes, 2).getParentId());
    }

    @Test
    public void aPlaceCanNestATypeThatTheSchemaKeepsSeparate() {
        List<PickerLayout.Catalog> catalog = Arrays.asList(
                new PickerLayout.Catalog("laptop", "Ноутбук", ""),
                new PickerLayout.Catalog("camera", "Камера", ""));
        List<PickerLayout.Node> nodes = PickerLayout.arrange(Arrays.asList(
                new PickerLayout.Source(1, null, "Сущевка", "P-1", "in_use", "branch", "Филиал", "", "", true,
                        Arrays.asList("laptop@", "camera@laptop")),
                gear(8, 1, "Ноутбук 1", "laptop", "Ноутбук", "", ""),
                gear(9, 1, "Камера 1", "camera", "Камера", "", "")), catalog);
        PickerLayout.Node laptop = groupNamed(nodes, "Ноутбук");
        PickerLayout.Node camera = groupNamed(nodes, "Камера");
        assertEquals(Integer.valueOf(1), laptop.getParentId());
        assertEquals(Integer.valueOf(laptop.getId()), camera.getParentId());
        assertEquals(Integer.valueOf(camera.getId()), node(nodes, 9).getParentId());
        List<PickerLayout.Node> flat = PickerLayout.arrange(Arrays.asList(
                place(2, null, "Рязанка"),
                gear(10, 2, "Камера 2", "camera", "Камера", "", "")), catalog);
        assertEquals(Integer.valueOf(2), groupNamed(flat, "Камера").getParentId());
    }

    @Test
    public void aRootTypeWithoutASubtypeIsStillItsOwnGroup() {
        List<PickerLayout.Node> nodes = PickerLayout.arrange(Arrays.asList(
                place(1, null, "Склад"),
                gear(8, 1, "Сканер", "scan", "Сканеры", "", "")));
        PickerLayout.Node group = groupNamed(nodes, "Сканеры");
        assertEquals(Integer.valueOf(1), group.getParentId());
        assertEquals(Integer.valueOf(group.getId()), node(nodes, 8).getParentId());
    }

    private static PickerLayout.Source place(int id, Integer parentId, String name) {
        return new PickerLayout.Source(id, parentId, name, "P-" + id, "in_use", "branch", "Филиал", "", "", true);
    }

    private static PickerLayout.Source gear(int id, int parentId, String name, String typeKey, String typeLabel,
                                            String parentTypeKey, String parentTypeLabel) {
        return new PickerLayout.Source(id, parentId, name, "E-" + id, "in_use", typeKey, typeLabel,
                parentTypeKey, parentTypeLabel, false);
    }

    private static PickerLayout.Node node(List<PickerLayout.Node> nodes, int id) {
        for (PickerLayout.Node node : nodes) {
            if (node.getId() == id) {
                return node;
            }
        }
        throw new AssertionError("missing " + id);
    }

    private static PickerLayout.Node groupNamed(List<PickerLayout.Node> nodes, String name) {
        for (PickerLayout.Node node : nodes) {
            if (node.isGroup() && name.equals(node.getName())) {
                return node;
            }
        }
        throw new AssertionError("missing group " + name);
    }
}
