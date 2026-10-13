package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class CardLayoutTest {
    @Test
    public void defaultsMatchTheCurrentSticker() {
        CardLayout layout = CardLayout.defaults();
        assertEquals(CardLayout.SIZE_CARD, layout.getSize());
        assertEquals(CardLayout.QR_LEFT, layout.getQr());
        assertEquals(Arrays.asList("name", "type", "place", "key", "scan"), layout.getLines());
    }

    @Test
    public void normalizeDropsUnknownLinesAndKeepsOrder() {
        CardLayout raw = new CardLayout();
        raw.setSize("wide");
        raw.setQr("top");
        raw.setLines(Arrays.asList("status", "nope", "name", "name", "attr:serial", "attr:Bad", ""));

        CardLayout layout = CardLayout.normalize(raw);

        assertEquals(CardLayout.SIZE_WIDE, layout.getSize());
        assertEquals(CardLayout.QR_TOP, layout.getQr());
        assertEquals(Arrays.asList("status", "name", "attr:serial"), layout.getLines());
    }

    @Test
    public void emptyDraftKeepsTheDefaultShapeButClearsLines() {
        CardLayout raw = new CardLayout();
        raw.setLines(Collections.<String>emptyList());

        CardLayout layout = CardLayout.normalize(raw);

        assertEquals(CardLayout.SIZE_CARD, layout.getSize());
        assertEquals(CardLayout.QR_LEFT, layout.getQr());
        assertTrue(layout.getLines().isEmpty());
    }

    @Test
    public void storedLinesRoundTrip() {
        String stored = CardLayout.join(Arrays.asList("name", "attr:model"));
        assertEquals(Arrays.asList("name", "attr:model"), CardLayout.split(stored));
        assertTrue(CardLayout.split(null).isEmpty());
        assertEquals("", CardLayout.join(null));
    }
}
