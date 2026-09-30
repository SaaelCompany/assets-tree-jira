package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class GrantCapsTest {
    @Test
    public void oldLevelsExpandToTheSameBundle() {
        assertEquals("view", GrantCaps.fromLevel("view"));
        assertEquals("view,create,edit,move,remove,comment", GrantCaps.fromLevel("edit"));
        assertTrue(GrantCaps.fromLevel("manage").contains("schema"));
        assertTrue(GrantCaps.fromLevel("manage").contains("access"));
        assertEquals("", GrantCaps.fromLevel("other"));
    }

    @Test
    public void normalizeKeepsViewAndDropsUnknownTokens() {
        assertEquals("view,edit,comment", GrantCaps.normalize("comment, edit, nope"));
        assertEquals("view,create,remove,comment", GrantCaps.normalize("create"));
        assertEquals("view", GrantCaps.normalize("view"));
        assertEquals("", GrantCaps.normalize(""));
        assertEquals("manage", GrantCaps.levelOf("view,schema"));
        assertEquals("edit", GrantCaps.levelOf("view,move"));
        assertFalse(GrantCaps.has("view,edit", GrantCaps.REMOVE));
        assertTrue(GrantCaps.has("view,remove", GrantCaps.REMOVE));
        assertTrue(GrantCaps.has("view,create", GrantCaps.REMOVE));
        assertTrue(GrantCaps.has("view,create", GrantCaps.COMMENT));
    }
}
