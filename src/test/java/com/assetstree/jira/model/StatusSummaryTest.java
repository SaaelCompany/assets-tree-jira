package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class StatusSummaryTest {
    @Test
    public void unsetKeepsTheThreeBuiltInCounters() {
        assertTrue(StatusSummary.shows(StatusSummary.UNSET, Statuses.REPAIR));
        assertTrue(StatusSummary.shows(StatusSummary.UNSET, Statuses.MAINTENANCE));
        assertTrue(StatusSummary.shows(StatusSummary.UNSET, Statuses.WRITTEN_OFF));
        assertFalse(StatusSummary.shows(StatusSummary.UNSET, Statuses.IN_STOCK));
        assertFalse(StatusSummary.shows(StatusSummary.UNSET, Statuses.IN_USE));
        assertFalse(StatusSummary.shows(StatusSummary.UNSET, "to"));
    }

    @Test
    public void explicitModeWinsOverTheDefault() {
        assertTrue(StatusSummary.shows(StatusSummary.SHOW, "to"));
        assertTrue(StatusSummary.shows(StatusSummary.SHOW, Statuses.IN_STOCK));
        assertFalse(StatusSummary.shows(StatusSummary.HIDE, Statuses.REPAIR));
        assertFalse(StatusSummary.shows(StatusSummary.HIDE, "ktc"));
    }

    @Test
    public void seedMarksOnlyTheBuiltInCounters() {
        assertEquals(StatusSummary.SHOW, StatusSummary.seedMode(Statuses.REPAIR));
        assertEquals(StatusSummary.SHOW, StatusSummary.seedMode(Statuses.MAINTENANCE));
        assertEquals(StatusSummary.SHOW, StatusSummary.seedMode(Statuses.WRITTEN_OFF));
        assertEquals(StatusSummary.UNSET, StatusSummary.seedMode(Statuses.IN_STOCK));
        assertEquals(StatusSummary.UNSET, StatusSummary.seedMode("poverka"));
    }

    @Test
    public void createShowsUnlessTheBoxIsClear() {
        assertEquals(StatusSummary.SHOW, StatusSummary.createMode(null));
        assertEquals(StatusSummary.SHOW, StatusSummary.createMode(Boolean.TRUE));
        assertEquals(StatusSummary.HIDE, StatusSummary.createMode(Boolean.FALSE));
    }

    @Test
    public void updateLeavesTheFlagWhenTheFieldIsMissing() {
        assertEquals(StatusSummary.SHOW, StatusSummary.updateMode(null, StatusSummary.SHOW));
        assertEquals(StatusSummary.HIDE, StatusSummary.updateMode(null, StatusSummary.HIDE));
        assertEquals(StatusSummary.UNSET, StatusSummary.updateMode(null, StatusSummary.UNSET));
        assertEquals(StatusSummary.SHOW, StatusSummary.updateMode(Boolean.TRUE, StatusSummary.HIDE));
        assertEquals(StatusSummary.HIDE, StatusSummary.updateMode(Boolean.FALSE, StatusSummary.SHOW));
    }
}
