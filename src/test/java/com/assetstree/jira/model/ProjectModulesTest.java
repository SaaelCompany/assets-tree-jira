package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class ProjectModulesTest {
    @Test
    public void unknownKeysDropAndTheRestStayUnique() {
        assertEquals(Arrays.asList("service", "reports"),
                ProjectModules.clean(Arrays.asList(" Service ", "nope", "reports", "service", null)));
        assertEquals("map,life", ProjectModules.join(Arrays.asList("life", "map", "floor")));
    }

    @Test
    public void emptyStorageMeansEveryModuleIsOff() {
        assertTrue(ProjectModules.split(null).isEmpty());
        assertTrue(ProjectModules.split("  ").isEmpty());
        assertFalse(ProjectModules.has(null, ProjectModules.SERVICE));
        assertTrue(ProjectModules.has("reports,service", ProjectModules.SERVICE));
        assertEquals(Collections.emptyList(), ProjectModules.clean(null));
        assertTrue(ProjectModules.known().contains(ProjectModules.PORTAL));
        assertTrue(ProjectModules.known().contains(ProjectModules.CARD));
        assertFalse(ProjectModules.has(null, ProjectModules.PORTAL));
        assertFalse(ProjectModules.has("service,map,reports,life", ProjectModules.CARD));
    }
}
