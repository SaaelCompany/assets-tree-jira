package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class PlaceLayoutTest {
    private static List<PlaceLayout.Fact> schema() {
        return Arrays.asList(
                new PlaceLayout.Fact("laptop", ""),
                new PlaceLayout.Fact("printer", "laptop"),
                new PlaceLayout.Fact("camera", "laptop"),
                new PlaceLayout.Fact("phone", ""),
                new PlaceLayout.Fact("server", ""));
    }

    @Test
    public void aLegacyPlaceKeepsTheSchemaNestingAndOrder() {
        List<PlaceLayout.Slot> slots = PlaceLayout.layout(
                Arrays.asList("printer", "phone", "camera"),
                Arrays.asList("printer", "phone", "camera"),
                schema());
        assertEquals(Arrays.asList("laptop", "printer", "camera", "phone"), keys(slots));
        assertEquals("laptop", parent(slots, "printer"));
        assertEquals("laptop", parent(slots, "camera"));
        assertEquals("", parent(slots, "phone"));
    }

    @Test
    public void anExplicitParentOverridesTheSchemaOnThatPlaceOnly() {
        List<PlaceLayout.Slot> slots = PlaceLayout.layout(
                Arrays.asList("phone@", "server@phone", "laptop@"),
                Arrays.asList("phone", "server", "laptop"),
                schema());
        assertEquals("phone", parent(slots, "server"));
        assertEquals("", parent(slots, "laptop"));
        assertEquals(Arrays.asList("phone", "server", "laptop"), keys(slots));
    }

    @Test
    public void movingUpThenNestingThenLiftingRewritesThePlace() {
        List<String> lines = Arrays.asList("laptop", "phone", "server");
        List<String> pinned = Arrays.asList("laptop", "phone", "server");
        List<String> up = PlaceLayout.move(lines, pinned, schema(), "server", PlaceLayout.UP);
        assertEquals(Arrays.asList("laptop@", "server@", "phone@"), up);
        List<String> nest = PlaceLayout.move(up, pinned, schema(), "server", PlaceLayout.NEST);
        assertEquals(Arrays.asList("laptop@", "server@laptop", "phone@"), nest);
        assertNull(PlaceLayout.move(nest, pinned, schema(), "laptop", PlaceLayout.NEST));
        List<String> lift = PlaceLayout.move(nest, pinned, schema(), "server", PlaceLayout.LIFT);
        assertEquals(Arrays.asList("laptop@", "server@", "phone@"), lift);
    }

    @Test
    public void draggingPlacesATypeBeforeAnotherAndNestsIt() {
        List<String> lines = Arrays.asList("laptop", "phone", "server");
        List<String> pinned = Arrays.asList("laptop", "phone", "server");
        List<String> before = PlaceLayout.move(lines, pinned, schema(), "server", "before:laptop");
        assertEquals(Arrays.asList("server@", "laptop@", "phone@"), before);
        List<String> into = PlaceLayout.move(before, pinned, schema(), "phone", "into:laptop");
        assertEquals(Arrays.asList("server@", "laptop@", "phone@laptop"), into);
        assertNull(PlaceLayout.move(into, pinned, schema(), "laptop", "into:server"));
        List<String> after = PlaceLayout.move(into, pinned, schema(), "server", "after:laptop");
        assertEquals(Arrays.asList("laptop@", "phone@laptop", "server@"), after);
    }

    @Test
    public void aTypeWithChildrenCannotBeNested() {
        List<String> lines = Arrays.asList("laptop", "printer", "phone");
        assertNull(PlaceLayout.move(lines, Arrays.asList("laptop", "printer", "phone"), schema(), "laptop", PlaceLayout.NEST));
    }

    @Test
    public void nestingStaysOneLevelDeep() {
        List<PlaceLayout.Slot> slots = PlaceLayout.layout(
                Arrays.asList("laptop@", "printer@laptop", "camera@printer"),
                Arrays.asList("laptop", "printer", "camera"),
                schema());
        assertEquals("", parent(slots, "camera"));
        assertEquals("laptop", parent(slots, "printer"));
    }

    @Test
    public void aNewPinOnAnOrderedPlaceStaysExplicit() {
        List<String> lines = PlaceLayout.addPin(
                Arrays.asList("laptop@", "phone@"),
                schema(),
                "printer");
        assertEquals(Arrays.asList("laptop@", "phone@", "printer@laptop"), lines);
        List<PlaceLayout.Slot> slots = PlaceLayout.layout(lines, Arrays.asList("laptop", "phone", "printer"), schema());
        assertEquals("laptop", parent(slots, "printer"));
    }

    @Test
    public void equipmentAloneStillShowsItsSchemaParent() {
        List<PlaceLayout.Slot> slots = PlaceLayout.layout(
                Collections.<String>emptyList(),
                Collections.singletonList("printer"),
                schema());
        assertEquals(Arrays.asList("laptop", "printer"), keys(slots));
        assertEquals("laptop", parent(slots, "printer"));
    }

    private static List<String> keys(List<PlaceLayout.Slot> slots) {
        List<String> keys = new java.util.ArrayList<String>();
        for (PlaceLayout.Slot slot : slots) {
            keys.add(slot.getTypeKey());
        }
        return keys;
    }

    private static String parent(List<PlaceLayout.Slot> slots, String key) {
        for (PlaceLayout.Slot slot : slots) {
            if (key.equals(slot.getTypeKey())) {
                return slot.getParentKey();
            }
        }
        throw new AssertionError(key);
    }
}
