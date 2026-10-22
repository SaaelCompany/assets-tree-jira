package com.assetstree.jira.ao;

import net.java.ao.schema.StringLength;
import org.junit.Test;

import java.io.InputStream;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.assertTrue;

public class EntityLimitsTest {
    @Test
    public void everyStringFitsActiveObjects() throws Exception {
        List<String> entities = new ArrayList<String>();
        InputStream in = getClass().getClassLoader().getResourceAsStream("atlassian-plugin.xml");
        String xml = new Scanner(in, StandardCharsets.UTF_8.name()).useDelimiter("\\A").next();
        Matcher matcher = Pattern.compile("<entity>([^<]+)</entity>").matcher(xml);
        while (matcher.find()) {
            entities.add(matcher.group(1).trim());
        }
        assertTrue(entities.size() > 10);
        List<String> wrong = new ArrayList<String>();
        for (String name : entities) {
            for (Method method : Class.forName(name).getMethods()) {
                StringLength length = method.getAnnotation(StringLength.class);
                if (length != null && length.value() != StringLength.UNLIMITED
                        && (length.value() < 1 || length.value() > StringLength.MAX_LENGTH)) {
                    wrong.add(name + "." + method.getName() + " = " + length.value());
                }
            }
        }
        assertTrue(wrong.toString(), wrong.isEmpty());
    }
}
