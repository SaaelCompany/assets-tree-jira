package com.assetstree.jira.servlet;

import org.junit.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class PortalPageMarkupTest {
    @Test
    public void insertsBootBeforeBody() {
        byte[] page = "<html><body><input name=\"customfield_1\"></body></html>".getBytes(StandardCharsets.UTF_8);
        byte[] snippet = "<div id=\"asset-tree-portal-boot\"></div>".getBytes(StandardCharsets.UTF_8);
        String out = new String(PortalPageMarkup.insertBoot(page, snippet), StandardCharsets.UTF_8);
        assertEquals("<html><body><input name=\"customfield_1\"><div id=\"asset-tree-portal-boot\"></div></body></html>", out);
    }

    @Test
    public void leavesJsonAlone() {
        byte[] page = "{\"html\":false}".getBytes(StandardCharsets.UTF_8);
        byte[] snippet = "<div id=\"asset-tree-portal-boot\"></div>".getBytes(StandardCharsets.UTF_8);
        assertTrue(same(page, PortalPageMarkup.insertBoot(page, snippet)));
    }

    @Test
    public void insertsOnce() {
        byte[] page = "<body><div id=\"asset-tree-portal-boot\"></div></body>".getBytes(StandardCharsets.UTF_8);
        byte[] snippet = "<div id=\"asset-tree-portal-boot\"></div>".getBytes(StandardCharsets.UTF_8);
        assertTrue(same(page, PortalPageMarkup.insertBoot(page, snippet)));
    }

    @Test
    public void snippetCarriesPortalAndEscapes() {
        String html = new String(PortalPageMarkup.snippet("/jira", 4, "STP", "customfield_10001"), StandardCharsets.UTF_8);
        assertTrue(html.contains("data-portal=\"4\""));
        assertTrue(html.contains("data-project=\"STP\""));
        assertTrue(html.contains("data-fields=\"customfield_10001\""));
        assertTrue(html.contains("/jira/download/resources/com.assetstree.jira.asset-tree:asset-tree-field/asset-field.js?v="));
        assertTrue(html.contains("<script src="));
        assertEquals("&quot;STP&quot;", PortalPageMarkup.escape("\"STP\""));
    }

    private boolean same(byte[] left, byte[] right) {
        if (left == right) {
            return true;
        }
        if (left == null || right == null || left.length != right.length) {
            return false;
        }
        for (int i = 0; i < left.length; i++) {
            if (left[i] != right[i]) {
                return false;
            }
        }
        return true;
    }
}
