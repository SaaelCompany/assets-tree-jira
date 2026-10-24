package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class PlaceHistoryTest {
    @Test
    public void nearestLocationKeepsTheChild() {
        assertEquals(Integer.valueOf(3), PlaceHistory.container(3, locations(), parents(), null));
        assertEquals(Integer.valueOf(3), PlaceHistory.container(4, locations(), parents(), null));
        assertNull(PlaceHistory.container(null, locations(), parents(), null));
    }

    @Test
    public void deletedBranchLandsOnThePlaceThatRemains() {
        Set<Integer> doomed = new HashSet<Integer>(Arrays.asList(3, 4, 6));
        assertEquals(Integer.valueOf(1), PlaceHistory.container(3, locations(), parents(), doomed));
        assertEquals(Integer.valueOf(1), PlaceHistory.container(4, locations(), parents(), doomed));
        assertNull(PlaceHistory.container(1, locations(), parents(), new HashSet<Integer>(Arrays.asList(1, 3, 4))));
    }

    @Test
    public void aMoveBetweenPlacesChangesTheContainer() {
        assertEquals(Integer.valueOf(3), PlaceHistory.container(3, locations(), parents(), null));
        assertEquals(Integer.valueOf(5), PlaceHistory.container(5, locations(), parents(), null));
        assertEquals(PlaceHistory.container(4, locations(), parents(), null),
                PlaceHistory.container(6, locations(), parents(), null));
    }

    private static Map<Integer, Integer> parents() {
        Map<Integer, Integer> parents = new LinkedHashMap<Integer, Integer>();
        parents.put(1, null);
        parents.put(2, null);
        parents.put(3, 1);
        parents.put(4, 3);
        parents.put(5, 1);
        parents.put(6, 3);
        return parents;
    }

    private static Map<Integer, Boolean> locations() {
        Map<Integer, Boolean> locations = new LinkedHashMap<Integer, Boolean>();
        locations.put(1, Boolean.TRUE);
        locations.put(2, Boolean.TRUE);
        locations.put(3, Boolean.TRUE);
        locations.put(4, Boolean.FALSE);
        locations.put(5, Boolean.TRUE);
        locations.put(6, Boolean.FALSE);
        return locations;
    }
}
