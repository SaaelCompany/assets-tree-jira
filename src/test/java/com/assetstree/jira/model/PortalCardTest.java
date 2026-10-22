package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class PortalCardTest {
    @Test
    public void nothingSavedShowsTheBuiltInSet() {
        assertEquals(PortalCard.DEFAULT_FIELDS, PortalCard.effective(null));
        assertEquals(PortalCard.DEFAULT_FIELDS, PortalCard.effective(""));
    }

    @Test
    public void savedKeysKeepTheirOrderAndDropTheCustodian() {
        assertEquals(Arrays.asList("status", "attr:laptop:model"),
                PortalCard.effective("status,custodian,attr:laptop:model,bogus"));
        assertEquals(Arrays.asList("type", "attr:laptop:model"),
                PortalCard.clean(Arrays.asList("type", "custodian", "name", "attr:laptop:model")));
        assertEquals(Collections.<String>emptyList(), PortalCard.clean(Collections.<String>emptyList()));
    }

    @Test(expected = AssetException.class)
    public void unknownKeysAreRejected() {
        PortalCard.clean(Arrays.asList("password"));
    }

    @Test
    public void fieldsMatchByNameAcrossTypes() {
        assertTrue(PortalCard.sameField("Модель", " модель "));
        assertFalse(PortalCard.sameField("Модель", "Серийный номер"));
        assertFalse(PortalCard.sameField(null, ""));
    }
}
