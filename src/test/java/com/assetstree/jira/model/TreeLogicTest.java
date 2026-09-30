package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class TreeLogicTest {
    @Test
    public void movingOntoSelfOrDescendantCycles() {
        Map<Integer, Integer> parents = new HashMap<Integer, Integer>();
        parents.put(1, null);
        parents.put(2, 1);
        parents.put(3, 2);
        parents.put(4, 1);

        assertTrue(TreeLogic.wouldCycle(parents, 1, 3));
        assertTrue(TreeLogic.wouldCycle(parents, 2, 3));
        assertTrue(TreeLogic.wouldCycle(parents, 2, 2));
        assertFalse(TreeLogic.wouldCycle(parents, 3, 4));
        assertFalse(TreeLogic.wouldCycle(parents, 3, null));
        assertFalse(TreeLogic.wouldCycle(parents, 4, 2));
    }

    @Test
    public void corruptParentChainDoesNotLoop() {
        Map<Integer, Integer> parents = new HashMap<Integer, Integer>();
        parents.put(1, 2);
        parents.put(2, 1);
        assertTrue(TreeLogic.wouldCycle(parents, 5, 1));
        assertEquals(Integer.MAX_VALUE, TreeLogic.depth(parents, 1));
    }

    @Test
    public void depthCountsEdgesToRoot() {
        Map<Integer, Integer> parents = new HashMap<Integer, Integer>();
        parents.put(1, null);
        parents.put(2, 1);
        parents.put(3, 2);
        assertEquals(0, TreeLogic.depth(parents, 1));
        assertEquals(2, TreeLogic.depth(parents, 3));
    }

    @Test
    public void descendantsWalkTheSubtree() {
        Map<Integer, List<Integer>> children = new HashMap<Integer, List<Integer>>();
        children.put(1, Arrays.asList(2, 3));
        children.put(2, Collections.singletonList(4));
        assertEquals(Arrays.asList(2, 4, 3), TreeLogic.descendants(children, 1));
        assertTrue(TreeLogic.descendants(children, 4).isEmpty());
        assertEquals(2, TreeLogic.subtreeHeight(children, 1));
        assertEquals(0, TreeLogic.subtreeHeight(children, 4));
    }

    @Test
    public void placeInsertsAfterRemoval() {
        assertEquals(Arrays.asList(3, 1, 2), TreeLogic.place(Arrays.asList(1, 2, 3), 3, 0));
        assertEquals(Arrays.asList(2, 3, 1), TreeLogic.place(Arrays.asList(1, 2, 3), 1, 5));
        assertEquals(Arrays.asList(1, 3, 2), TreeLogic.place(Arrays.asList(1, 2, 3), 3, 1));
    }

    @Test
    public void slugAndUniqueKeyStayPortable() {
        assertEquals("rack-a", TreeLogic.slug("Rack A"));
        assertEquals("", TreeLogic.slug("Стойка"));
        HashSet<String> taken = new HashSet<String>();
        taken.add("type");
        assertEquals("type-2", TreeLogic.uniqueKey(TreeLogic.slug("Стойка"), taken));
        assertTrue(AssetValidator.isTypeKey(TreeLogic.uniqueKey("rack", taken)));
    }

    @Test
    public void defaultTypesAreValidAndUnique() {
        HashSet<String> keys = new HashSet<String>();
        for (DefaultTypes.Seed seed : DefaultTypes.ALL) {
            assertTrue(keys.add(seed.getKey()));
            assertTrue(AssetValidator.isTypeKey(seed.getKey()));
            assertEquals(null, AssetValidator.validateColor(seed.getColor()));
        }
    }
}
