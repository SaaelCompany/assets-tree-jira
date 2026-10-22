package com.assetstree.jira.model;

import org.junit.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class TypeIconsTest {
    @Test
    public void knownKeysAreAcceptedAndUnknownFallBack() {
        assertTrue(TypeIcons.isIcon("printer"));
        assertFalse(TypeIcons.isIcon("Printer"));
        assertFalse(TypeIcons.isIcon(null));
        assertFalse(TypeIcons.isIcon("<script>"));
        assertEquals("printer", TypeIcons.resolve(" Printer ", false));
        assertEquals(TypeIcons.DEFAULT_PLACE, TypeIcons.resolve(null, true));
        assertEquals(TypeIcons.DEFAULT_OBJECT, TypeIcons.resolve("", false));
        assertEquals(TypeIcons.DEFAULT_PLACE, TypeIcons.resolve("nope", true));
    }

    @Test
    public void defaultsAreInTheCatalogAndKeysAreUnique() {
        assertTrue(TypeIcons.isIcon(TypeIcons.DEFAULT_PLACE));
        assertTrue(TypeIcons.isIcon(TypeIcons.DEFAULT_OBJECT));
        assertEquals(TypeIcons.ALL.size(), new HashSet<String>(TypeIcons.ALL).size());
        for (String key : TypeIcons.ALL) {
            assertTrue(key, key.matches("^[a-z][a-z0-9]*$"));
        }
    }

    @Test
    public void pageScriptDrawsEveryKeyAndEachHasALabel() throws IOException {
        String script = new String(Files.readAllBytes(Paths.get("src/main/resources/js/type-icons.js")), StandardCharsets.UTF_8);
        Matcher matcher = Pattern.compile("\\{ key: '([a-z0-9]+)', g: '([a-z]+)', d: '").matcher(script);
        Set<String> drawn = new HashSet<String>();
        while (matcher.find()) {
            drawn.add(matcher.group(1));
        }
        assertEquals(new HashSet<String>(TypeIcons.ALL), drawn);
        for (String file : new String[] {"asset-tree.properties", "asset-tree_ru_RU.properties"}) {
            Properties labels = new Properties();
            labels.load(Files.newInputStream(Paths.get("src/main/resources/i18n/" + file)));
            for (String key : TypeIcons.ALL) {
                String name = "asset-tree.ui.icon" + Character.toUpperCase(key.charAt(0)) + key.substring(1);
                assertTrue(file + " " + name, labels.getProperty(name, "").trim().length() > 0);
            }
        }
    }
}
