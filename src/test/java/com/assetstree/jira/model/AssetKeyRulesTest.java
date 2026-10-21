package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class AssetKeyRulesTest {
    @Test
    public void keepsAJiraLikePrefix() {
        assertEquals("EQ", AssetKeyRules.normalize(" eq "));
        assertEquals("EQ2", AssetKeyRules.normalize("eq2"));
        assertNull(AssetKeyRules.invalid("EQ"));
        assertNull(AssetKeyRules.invalid("A1"));
        assertNull(AssetKeyRules.invalid("EQUIPMENT1"));
    }

    @Test
    public void rejectsAShortDigitOrDecoratedPrefix() {
        assertEquals("asset-tree.error.assetKey.required", AssetKeyRules.invalid(""));
        assertEquals("asset-tree.error.assetKey.required", AssetKeyRules.invalid(AssetKeyRules.normalize("  ")));
        assertEquals("asset-tree.error.assetKey.format", AssetKeyRules.invalid("E"));
        assertEquals("asset-tree.error.assetKey.format", AssetKeyRules.invalid("1EQ"));
        assertEquals("asset-tree.error.assetKey.format", AssetKeyRules.invalid("EQ-1"));
        assertEquals("asset-tree.error.assetKey.format", AssetKeyRules.invalid("EQUIPMENT12"));
    }
}
