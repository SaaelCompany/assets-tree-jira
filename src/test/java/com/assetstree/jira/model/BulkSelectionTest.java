package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class BulkSelectionTest {
    @Test
    public void ancestorCoversSelectedDescendants() {
        List<Integer> roots = BulkSelection.keepRoots(Arrays.asList(1, 2, 3, 4), tree());
        assertEquals(Arrays.asList(1), roots);
        assertTrue(BulkSelection.isUnder(3, 1, tree()));
        assertFalse(BulkSelection.isUnder(1, 1, tree()));
    }

    @Test
    public void siblingsStaySeparateAndChildrenGoFirst() {
        assertEquals(Arrays.asList(3, 4), BulkSelection.keepRoots(Arrays.asList(3, 4), tree()));
        assertEquals(Arrays.asList(3, 2, 4, 1), BulkSelection.deepestFirst(Arrays.asList(1, 2, 3, 4), tree()));
    }

    private static Map<Integer, Integer> tree() {
        Map<Integer, Integer> parents = new LinkedHashMap<Integer, Integer>();
        parents.put(1, null);
        parents.put(2, 1);
        parents.put(3, 2);
        parents.put(4, 1);
        return parents;
    }
}
