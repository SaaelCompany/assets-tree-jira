package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class LabsTest {
    @Test
    public void everythingIsOffByDefault() {
        assertTrue(Labs.split(null).isEmpty());
        assertTrue(Labs.split("").isEmpty());
        assertTrue(Labs.clean(null).isEmpty());
    }

    @Test
    public void keepsKnownFeaturesInFixedOrderOnce() {
        assertEquals(Arrays.asList("schedule", "reports", "lifecycle"),
                Labs.clean(Arrays.asList(" Lifecycle", "reports", "spaceship", "schedule", "reports")));
        assertEquals("map,reports", Labs.join(Arrays.asList("reports", "map")));
        assertEquals(Arrays.asList("map", "reports"), Labs.split("reports,map,unknown"));
        assertEquals("", Labs.join(Collections.<String>emptyList()));
    }

    @Test
    public void onlyProjectDocumentsHaveAKind() {
        assertEquals("schedule", Labs.labOfDoc("schedule"));
        assertEquals("map", Labs.labOfDoc("MAP"));
        assertEquals("reports", Labs.labOfDoc("reports"));
        assertNull(Labs.labOfDoc("life"));
        assertNull(Labs.labOfDoc("lifecycle"));
        assertNull(Labs.labOfDoc(null));
    }

    @Test
    public void bodyMustBeAJsonObjectWithinTheLimit() {
        assertEquals("{}", Labs.body(null, 100));
        assertEquals("{\"a\":1}", Labs.body(" {\"a\":1} ", 100));
        try {
            Labs.body("[1,2]", 100);
            fail();
        } catch (AssetException expected) {
            assertEquals(400, expected.getStatus());
        }
        try {
            Labs.body("{\"a\":\"" + new String(new char[200]).replace('\0', 'x') + "\"}", 100);
            fail();
        } catch (AssetException expected) {
            assertEquals(400, expected.getStatus());
        }
        assertFalse(Labs.text(new String(new char[600]).replace('\0', 'y')).length() > Labs.TEXT);
    }

    @Test
    public void jsonCheckAcceptsObjectsOnly() {
        assertTrue(JsonCheck.isObject("{\"floors\":[{\"id\":\"f1\",\"w\":1200.5,\"pins\":[],\"ok\":true,\"x\":null,\"n\":-1e3}]}"));
        assertTrue(JsonCheck.isObject("{\"s\":\"\\u0410\\n\\\"q\\\"\"}"));
        assertFalse(JsonCheck.isObject("{\"a\":1,}"));
        assertFalse(JsonCheck.isObject("{\"a\":01x}"));
        assertFalse(JsonCheck.isObject("{\"a\":1} trailing"));
        assertFalse(JsonCheck.isObject("{'a':1}"));
        assertFalse(JsonCheck.isObject("\"text\""));
        assertFalse(JsonCheck.isObject("{\"a\":\"\\x\"}"));
        assertFalse(JsonCheck.isObject(null));
        StringBuilder deep = new StringBuilder("{\"a\":");
        for (int i = 0; i < 60; i++) deep.append('[');
        for (int i = 0; i < 60; i++) deep.append(']');
        deep.append('}');
        assertFalse(JsonCheck.isObject(deep.toString()));
    }
}
