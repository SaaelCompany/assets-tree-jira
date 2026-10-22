package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class ViewColumnsTest {
    @Test
    public void keepsOrderDropsNameAndRepeats() {
        List<String> clean = ViewColumns.clean(Arrays.asList("status", "name", " key ", "attr:serial-no", "status", ""));
        assertEquals(Arrays.asList("status", "key", "attr:serial-no"), clean);
        assertEquals("status,key,attr:serial-no", ViewColumns.join(clean));
        assertEquals(clean, ViewColumns.split("status,key,attr:serial-no"));
    }

    @Test
    public void rejectsUnknownColumns() {
        try {
            ViewColumns.clean(Arrays.asList("key", "password"));
            fail();
        } catch (AssetException ex) {
            assertEquals(400, ex.getStatus());
        }
    }

    @Test
    public void readsStoredListSafely() {
        assertTrue(ViewColumns.split(null).isEmpty());
        assertEquals(Arrays.asList("type", "updated"), ViewColumns.split("type,,bogus,updated,type"));
    }
}
