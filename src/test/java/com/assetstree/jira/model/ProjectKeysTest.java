package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class ProjectKeysTest {
    @Test
    public void projectSlugKeepsTypesApart() {
        assertEquals("it-warehouse", ProjectKeys.typeKey("IT", "warehouse"));
        assertEquals("med-equipment", ProjectKeys.typeKey("MED", "equipment"));
        assertFalse(ProjectKeys.same("IT", "MED"));
        assertTrue(ProjectKeys.same("med", "MED"));
    }

    @Test
    public void legacyStatusesMapOntoTheWorkingSet() {
        assertEquals(Statuses.IN_USE, Statuses.canonical(Statuses.ACTIVE));
        assertEquals(Statuses.WRITTEN_OFF, Statuses.canonical(Statuses.RETIRED));
        assertTrue(Statuses.allowed(Statuses.IN_STOCK));
        assertFalse(Statuses.allowed("broken"));
    }
}
