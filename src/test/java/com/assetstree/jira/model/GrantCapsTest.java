package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class GrantCapsTest {
    @Test
    public void rolesStaySeparateUntilABroaderOneIsChosen() {
        assertEquals("view", GrantCaps.normalize("view"));
        assertEquals("view,places", GrantCaps.normalize("places"));
        assertEquals("view,types", GrantCaps.normalize("types"));
        assertEquals("view,object", GrantCaps.normalize("object"));
        assertEquals("view,places,types,object,assets", GrantCaps.normalize("assets"));
        assertEquals("view,places,types,object,assets,admin", GrantCaps.normalize("admin"));
        assertFalse(GrantCaps.has("places", GrantCaps.OBJECT));
        assertFalse(GrantCaps.has("object", GrantCaps.PLACES));
        assertFalse(GrantCaps.has("types", GrantCaps.OBJECT));
        assertTrue(GrantCaps.has("assets", GrantCaps.PLACES));
        assertTrue(GrantCaps.has("assets", GrantCaps.TYPES));
        assertTrue(GrantCaps.has("assets", GrantCaps.OBJECT));
        assertFalse(GrantCaps.has("assets", GrantCaps.ADMIN));
        assertTrue(GrantCaps.has("admin", GrantCaps.ASSETS));
    }

    @Test
    public void olderLevelsStillOpenTheSameWork() {
        assertEquals("view", GrantCaps.fromLevel("view"));
        assertTrue(GrantCaps.has(GrantCaps.fromLevel("edit"), GrantCaps.PLACES));
        assertTrue(GrantCaps.has(GrantCaps.fromLevel("edit"), GrantCaps.OBJECT));
        assertFalse(GrantCaps.has(GrantCaps.fromLevel("edit"), GrantCaps.TYPES));
        assertTrue(GrantCaps.has(GrantCaps.fromLevel("manage"), GrantCaps.ASSETS));
        assertFalse(GrantCaps.has(GrantCaps.fromLevel("manage"), GrantCaps.ADMIN));
        assertEquals("view,places,types,object,assets", GrantCaps.normalize("schema,access"));
        assertEquals("view,places,object", GrantCaps.normalize("create,edit"));
        assertEquals("", GrantCaps.normalize(""));
        assertEquals("admin", GrantCaps.levelOf("admin"));
        assertEquals("assets", GrantCaps.levelOf("assets"));
        assertEquals("view", GrantCaps.levelOf("view"));
    }
}
