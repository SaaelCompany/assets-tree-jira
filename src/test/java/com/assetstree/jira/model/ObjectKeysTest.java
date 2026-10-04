package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ObjectKeysTest {
    @Test
    public void eachProjectGetsItsOwnKey() {
        assertEquals("STP-1", ObjectKeys.format("stp", 1));
        assertEquals("IT-1", ObjectKeys.format("IT", 1));
        assertEquals("TEST-12", ObjectKeys.format("test", 12));
    }

    @Test
    public void prefixKeepsLettersAndDigits() {
        assertEquals("STP", ObjectKeys.prefix(" stp "));
        assertEquals("TEST1", ObjectKeys.prefix("test-1"));
        assertEquals("AST", ObjectKeys.prefix(null));
        assertEquals("AST", ObjectKeys.prefix("---"));
        assertEquals(20, ObjectKeys.prefix("ABCDEFGHIJKLMNOPQRSTUVWXYZ").length());
    }

    @Test
    public void suffixReadsOnlyThatProjectsSequence() {
        assertEquals(12, ObjectKeys.suffix("STP", "STP-12"));
        assertEquals(4, ObjectKeys.suffix("STP", "stp-4"));
        assertEquals(0, ObjectKeys.suffix("STP", "AST-12"));
        assertEquals(0, ObjectKeys.suffix("ST", "STP-1"));
        assertEquals(0, ObjectKeys.suffix("TEST", "TEST-1-2"));
        assertEquals(0, ObjectKeys.suffix("STP", null));
    }
}
