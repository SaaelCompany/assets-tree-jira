package com.assetstree.jira.model;

import org.junit.Test;

import java.util.HashSet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class TypeIconsTest {
    @Test
    public void knownKeysAreAcceptedAndUnknownFallBack() {
        assertTrue(TypeIcons.isIcon("printer"));
        assertFalse(TypeIcons.isIcon("Printer"));
        assertFalse(TypeIcons.isIcon(null));
        assertFalse(TypeIcons.isIcon("<script>"));
        assertEquals("printer", TypeIcons.resolve(" Printer ", false));
        assertEquals(TypeIcons.DEFAULT_PLACE, TypeIcons.resolve(null, true));
        assertEquals(TypeIcons.DEFAULT_OBJECT, TypeIcons.resolve("", false));
        assertEquals(TypeIcons.DEFAULT_PLACE, TypeIcons.resolve("nope", true));
    }

    @Test
    public void defaultsAreInTheCatalogAndKeysAreUnique() {
        assertTrue(TypeIcons.isIcon(TypeIcons.DEFAULT_PLACE));
        assertTrue(TypeIcons.isIcon(TypeIcons.DEFAULT_OBJECT));
        assertEquals(TypeIcons.ALL.size(), new HashSet<String>(TypeIcons.ALL).size());
        for (String key : TypeIcons.ALL) {
            assertTrue(key, key.matches("^[a-z]+$"));
        }
    }
}
