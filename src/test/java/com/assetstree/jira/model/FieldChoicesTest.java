package com.assetstree.jira.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class FieldChoicesTest {
    @Test
    public void optionsKeepTheFirstSpellingAndRejectABlankList() {
        assertEquals("Windows\nlinux", FieldChoices.canonicalOptions(" Windows \nlinux\n\nLinux "));
        assertNull(FieldChoices.canonicalOptions("  \n  "));
        assertNull(FieldChoices.canonicalOptions(null));
    }

    @Test
    public void choicesMustComeFromTheList() {
        String options = "Склад\nОфис\nЦех";
        assertEquals("Офис", FieldChoices.canonicalValue(FieldKinds.SELECT, options, "офис"));
        assertNull(FieldChoices.canonicalValue(FieldKinds.RADIO, options, "Дом"));
        assertEquals("Склад\nЦех", FieldChoices.canonicalValue(FieldKinds.CHECKS, options, "Цех, Склад"));
        assertNull(FieldChoices.canonicalValue(FieldKinds.SELECTS, options, "Офис, Дом"));
        assertNull(FieldChoices.canonicalValue(FieldKinds.CHECKS, options, "Склад, Дом"));
        assertEquals("", FieldChoices.canonicalValue(FieldKinds.SELECT, options, "  "));
    }

    @Test
    public void labelsLinksAndVersionsHaveTheirOwnShape() {
        assertEquals("синий\nсклад", FieldChoices.canonicalValue(FieldKinds.LABELS, "", "синий, склад"));
        assertNull(FieldChoices.canonicalValue(FieldKinds.LABELS, "", "меткакотораяявнодлиннеесорокасимволовточнода"));
        assertEquals("https://example.com/a", FieldChoices.canonicalValue(FieldKinds.URL, "", " https://example.com/a "));
        assertNull(FieldChoices.canonicalValue(FieldKinds.URL, "", "javascript:alert(1)"));
        assertEquals("2.0-beta\n1.2", FieldChoices.canonicalValue(FieldKinds.VERSION, "", "2.0-beta, 1.2"));
        assertEquals("Release 2", FieldChoices.canonicalValue(FieldKinds.VERSION, "", "Release 2"));
        assertNull(FieldChoices.canonicalValue(FieldKinds.VERSION, "", "бета"));
        assertEquals("1.2, 2.0-beta", FieldChoices.display("1.2\n2.0-beta"));
    }
}
