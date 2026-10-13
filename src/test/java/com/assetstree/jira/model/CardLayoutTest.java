package com.assetstree.jira.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
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

    @Test
    public void freeBlocksKeepCaptionLogoAndCustomCode() {
        CardElement caption = block("text");
        caption.setText("  \u041c\u041e\u041b:\n\"\u0418\u0432\u0430\u043d\u043e\u0432\"  ");
        caption.setX(4);
        caption.setY(6);
        caption.setW(40);
        caption.setH(12);
        caption.setSize(14);
        caption.setColor("#DE350B");
        caption.setFont("serif");
        caption.setBold(true);
        caption.setAlign("center");

        CardElement field = block("field");
        field.setToken("attr:serial");
        field.setX(4);
        field.setY(20);

        CardElement dropped = block("field");
        dropped.setToken("attr:Bad");

        CardElement logo = block("logo");
        logo.setSrc("data:image/png;base64,iVBORw0KGgo=");
        logo.setX(60);
        logo.setY(4);
        logo.setW(18);
        logo.setH(10);

        CardElement ownCode = block("qr");
        ownCode.setToken("custom");
        ownCode.setText("https://example.com/room");
        ownCode.setX(40);
        ownCode.setY(30);
        ownCode.setW(20);
        ownCode.setH(20);

        CardElement assetCode = block("qr");
        assetCode.setToken("asset");
        assetCode.setX(3);
        assetCode.setY(4);
        assetCode.setW(22);
        assetCode.setH(22);

        CardLayout raw = new CardLayout();
        raw.setSize("wide");
        raw.setElements(Arrays.asList(caption, field, dropped, logo, ownCode, assetCode, null));

        CardLayout layout = CardLayout.normalize(raw);
        String stored = CardCanvas.write(layout.getElements());
        CardLayout again = new CardLayout();
        again.setSize("wide");
        again.setElements(CardCanvas.read(stored));
        again = CardLayout.normalize(again);

        assertEquals(4, again.getElements().size());
        CardElement keptCaption = again.getElements().get(0);
        assertEquals("text", keptCaption.getKind());
        assertEquals("\u041c\u041e\u041b:\n\"\u0418\u0432\u0430\u043d\u043e\u0432\"", keptCaption.getText());
        assertEquals(14, keptCaption.getSize());
        assertEquals("#de350b", keptCaption.getColor());
        assertEquals("serif", keptCaption.getFont());
        assertTrue(keptCaption.getBold());
        assertEquals("center", keptCaption.getAlign());
        assertEquals("attr:serial", again.getElements().get(1).getToken());
        assertEquals("logo", again.getElements().get(2).getKind());
        assertEquals("asset", again.getElements().get(3).getToken());
        assertEquals(Arrays.asList("attr:serial"), again.getLines());
        assertEquals(CardLayout.QR_LEFT, again.getQr());
        assertNull(CardCanvas.read("{"));
        assertTrue(CardCanvas.read("[]").isEmpty());
    }

    @Test
    public void missingCanvasKeepsTheLineLayout() {
        CardLayout raw = new CardLayout();
        raw.setLines(Arrays.asList("name", "key"));

        CardLayout layout = CardLayout.normalize(raw);

        assertNull(layout.getElements());
        assertEquals(Arrays.asList("name", "key"), layout.getLines());
        assertEquals(Integer.valueOf(2), layout.getGrid());
        assertEquals(Double.valueOf(86), layout.getWidth());
    }

    @Test
    public void customSizeAndGridStayInsideTheSheet() {
        CardLayout raw = new CardLayout();
        raw.setSize("custom");
        raw.setWidth(Double.valueOf(12));
        raw.setHeight(Double.valueOf(400));
        raw.setGrid(Integer.valueOf(5));

        CardLayout layout = CardLayout.normalize(raw);

        assertEquals(CardLayout.SIZE_CUSTOM, layout.getSize());
        assertEquals(Double.valueOf(15), layout.getWidth());
        assertEquals(Double.valueOf(297), layout.getHeight());
        assertEquals(Integer.valueOf(5), layout.getGrid());

        raw.setGrid(Integer.valueOf(3));
        assertEquals(Integer.valueOf(2), CardLayout.normalize(raw).getGrid());
        raw.setGrid(Integer.valueOf(0));
        assertEquals(Integer.valueOf(0), CardLayout.normalize(raw).getGrid());
    }

    @Test
    public void onePictureSlotAndASecondIsDropped() {
        CardElement first = block("picture");
        first.setId("pic1");
        first.setX(10);
        first.setY(8);
        first.setW(30);
        first.setH(30);
        CardElement second = block("picture");
        second.setId("pic2");

        CardLayout layout = CardLayout.normalize(layoutOf(first, second));

        assertEquals(1, layout.getElements().size());
        assertEquals("picture", layout.getElements().get(0).getKind());
        assertEquals("", layout.getElements().get(0).getSrc());
        assertEquals(30, layout.getElements().get(0).getW(), 0.001);
    }

    private static CardLayout layoutOf(CardElement... elements) {
        CardLayout raw = new CardLayout();
        raw.setElements(Arrays.asList(elements));
        return raw;
    }

    private static CardElement block(String kind) {
        CardElement element = new CardElement();
        element.setId(kind + "01");
        element.setKind(kind);
        return element;
    }
}
