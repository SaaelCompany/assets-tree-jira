package com.assetstree.jira.model;

import com.assetstree.jira.dto.FlowRuleDto;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class FlowRulesTest {
    private static final Set<String> KNOWN = new HashSet<String>(Arrays.asList("in_stock", "in_use", "repair"));

    @Test
    public void equipmentAddedOnThatRequestTypeTakesTheConfiguredStatus() {
        FlowRuleDto incident = rule(1, "10001", "repair");
        FlowRuleDto service = rule(2, "10002", "in_use");
        assertEquals("repair", FlowRules.statusToApply(Arrays.asList(incident, service), "10001", true, "in_stock", KNOWN));
        assertEquals("in_use", FlowRules.statusToApply(Arrays.asList(incident, service), "10002", true, "in_stock", KNOWN));
    }

    @Test
    public void unknownTypePlaceAndSameOrInvalidStatusDoNothing() {
        FlowRuleDto incident = rule(1, "10001", "repair");
        FlowRuleDto otherProject = rule(2, "10009", "written_off");
        assertNull(FlowRules.statusToApply(Collections.singletonList(incident), "10009", true, "in_stock", KNOWN));
        assertNull(FlowRules.statusToApply(Collections.singletonList(incident), "10001", false, "in_stock", KNOWN));
        assertNull(FlowRules.statusToApply(Collections.singletonList(incident), "10001", true, "repair", KNOWN));
        assertNull(FlowRules.statusToApply(Collections.singletonList(otherProject), "10009", true, "in_stock", KNOWN));
        assertNull(FlowRules.statusToApply(Collections.singletonList(incident), "  ", true, "in_stock", KNOWN));
        assertNull(FlowRules.statusToApply(null, "10001", true, "in_stock", KNOWN));
    }

    @Test
    public void laterRuleForTheSameTypeWins() {
        FlowRuleDto first = rule(1, "10001", "repair");
        FlowRuleDto second = rule(2, "10001", "in_use");
        assertEquals("in_use", FlowRules.statusToApply(Arrays.asList(first, second), "10001", true, "in_stock", KNOWN));
    }

    private static FlowRuleDto rule(int id, String typeId, String status) {
        FlowRuleDto dto = new FlowRuleDto();
        dto.setId(id);
        dto.setIssueTypeId(typeId);
        dto.setStatusKey(status);
        return dto;
    }
}
