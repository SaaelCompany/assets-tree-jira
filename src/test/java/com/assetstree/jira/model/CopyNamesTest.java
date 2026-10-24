package com.assetstree.jira.model;

import org.junit.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class CopyNamesTest {
    @Test
    public void firstCopyUsesTheWordThenANumber() {
        Set<String> taken = new HashSet<String>();
        assertEquals("Сканер (копия)", CopyNames.next("Сканер", "копия", taken));
        taken.add("Сканер (копия)");
        assertEquals("Сканер (копия 2)", CopyNames.next("Сканер", "копия", taken));
        taken.add("Сканер (копия 2)");
        assertEquals("Сканер (копия 3)", CopyNames.next("  Сканер  ", " копия ", taken));
        assertEquals("Item (copy)", CopyNames.next("Item", "copy", null));
        assertEquals("Item (copy)", CopyNames.next("Item", "  ", null));
    }

    @Test
    public void longNamesStayWithinTheLimit() {
        StringBuilder stem = new StringBuilder();
        for (int i = 0; i < AssetValidator.MAX_NAME; i++) {
            stem.append('A');
        }
        String copy = CopyNames.next(stem.toString(), "копия", null);
        assertEquals(AssetValidator.MAX_NAME, copy.length());
        assertTrue(copy.endsWith(" (копия)"));
    }
}
