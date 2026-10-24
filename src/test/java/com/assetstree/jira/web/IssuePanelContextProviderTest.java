package com.assetstree.jira.web;

import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;

public class IssuePanelContextProviderTest {
    @Test
    public void missingIssueDoesNotPretendThePanelWasLoaded() {
        IssuePanelContextProvider provider = new IssuePanelContextProvider();
        Map<String, Object> context = new HashMap<String, Object>();

        Map<String, Object> result = provider.getContextMap(context);

        assertSame(context, result);
        assertFalse(result.containsKey("assetTreeReady"));
        assertFalse(result.containsKey("assetTreeAssets"));
    }

    @Test
    public void nullContextReturnsAnEmptyMap() {
        Map<String, Object> result = new IssuePanelContextProvider().getContextMap(null);
        assertFalse(result.containsKey("assetTreeReady"));
    }
}
