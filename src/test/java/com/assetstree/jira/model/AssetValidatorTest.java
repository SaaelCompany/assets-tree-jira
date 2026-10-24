package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class AssetValidatorTest {
    @Test
    public void nameIsRequiredAndBounded() {
        assertEquals("asset-tree.error.name.required", AssetValidator.validateDraft(null));
        AssetDraft blank = new AssetDraft();
        blank.setName("  ");
        assertEquals("asset-tree.error.name.required", AssetValidator.validateDraft(blank));

        AssetDraft ok = new AssetDraft();
        ok.setName("Стойка A");
        ok.setStatus(Statuses.ACTIVE);
        assertNull(AssetValidator.validateDraft(ok));

        AssetDraft custom = new AssetDraft();
        custom.setName("Rack");
        custom.setStatus("broken");
        assertNull(AssetValidator.validateDraft(custom));

        AssetDraft badStatus = new AssetDraft();
        badStatus.setName("Rack");
        badStatus.setStatus("Broken!");
        assertEquals("asset-tree.error.status", AssetValidator.validateDraft(badStatus));
    }

    @Test
    public void captionMayBeEmptyAndStaysShort() {
        assertNull(AssetValidator.validateCaption(null));
        assertNull(AssetValidator.validateCaption("  "));
        assertNull(AssetValidator.validateCaption("Кабинет"));
        StringBuilder longCaption = new StringBuilder();
        for (int i = 0; i < 81; i++) {
            longCaption.append('a');
        }
        assertEquals("asset-tree.error.caption.length", AssetValidator.validateCaption(longCaption.toString()));
    }

    @Test
    public void attributesRejectDuplicatesAndEmptyNames() {
        AttributeDraft empty = new AttributeDraft();
        empty.setName(" ");
        empty.setValue("x");
        AttributeDraft serial = new AttributeDraft();
        serial.setName("Serial");
        serial.setValue("1");
        AttributeDraft again = new AttributeDraft();
        again.setName("serial");
        again.setValue("2");
        assertEquals("asset-tree.error.attribute.name",
                AssetValidator.validateAttributes(Collections.singletonList(empty)));
        assertEquals("asset-tree.error.attribute.duplicate",
                AssetValidator.validateAttributes(Arrays.asList(serial, again)));
        assertNull(AssetValidator.validateAttributes(Collections.singletonList(serial)));
    }

    @Test
    public void issueKeysAreNormalized() {
        assertEquals("SD-14", AssetValidator.normalizeIssueKey(" sd-14 "));
        assertTrue(AssetValidator.isIssueKey("sd-14"));
        assertFalse(AssetValidator.isIssueKey("not a key"));
        assertEquals("asset-tree.error.type.color", AssetValidator.validateColor("green"));
        assertNull(AssetValidator.validateColor("#0F6E56"));
    }
}
