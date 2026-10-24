package com.assetstree.jira.web;

import org.junit.Test;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UiCatalogTest {
    @Test
    public void catalogsMatchBothLocales() throws Exception {
        Properties english = load("i18n/asset-tree.properties");
        Properties russian = load("i18n/asset-tree_ru_RU.properties");
        Set<String> expected = new HashSet<String>();
        for (String key : UiCatalog.KEYS) {
            expected.add("asset-tree.ui." + key);
        }
        assertEquals(expected, uiKeys(english));
        assertEquals(expected, uiKeys(russian));
        String title = russian.getProperty("asset-tree.ui.title");
        assertTrue(title != null && title.indexOf('\u0410') >= 0);
        assertTrue(russian.getProperty("asset-tree.permission.manage.name").length() > 0);
        assertTrue(english.getProperty("asset-tree.error.cycle").length() > 0);
    }

    private static Set<String> uiKeys(Properties properties) {
        Set<String> keys = new HashSet<String>();
        for (String name : properties.stringPropertyNames()) {
            if (name.startsWith("asset-tree.ui.")) {
                keys.add(name);
            }
        }
        return keys;
    }

    private static Properties load(String path) throws Exception {
        InputStream input = UiCatalogTest.class.getClassLoader().getResourceAsStream(path);
        assertTrue(path + " is on the classpath", input != null);
        try {
            Properties properties = new Properties();
            properties.load(new InputStreamReader(input, Charset.forName("ISO-8859-1")));
            return properties;
        } finally {
            input.close();
        }
    }
}
