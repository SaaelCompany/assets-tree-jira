package com.assetstree.jira.model;

import com.assetstree.jira.dto.PortalRuleDto;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class PortalRulesTest {
    @Test
    public void oneFieldOpensItsPlaceAndTwoFieldsOpenTheDepartment() {
        PortalRuleDto placeA = rule(1, 10, condition("Площадка", "Пункт А"));
        PortalRuleDto placeB = rule(2, 20, condition("Площадка", "Пункт Б"));
        PortalRuleDto department = rule(3, 11, condition("Площадка", "Пункт А"), condition("Отделение", "Пункт А"));
        Map<Integer, Integer> parents = new HashMap<Integer, Integer>();
        parents.put(Integer.valueOf(10), null);
        parents.put(Integer.valueOf(20), null);
        parents.put(Integer.valueOf(11), Integer.valueOf(10));

        assertEquals(10, PortalRules.choose(Arrays.asList(placeA, placeB, department),
                Collections.singletonList(answer("Площадка", "Пункт А")), parents).getAssetId());
        assertEquals(20, PortalRules.choose(Arrays.asList(placeA, placeB, department),
                Collections.singletonList(answer("Площадка", "Пункт Б")), parents).getAssetId());
        assertEquals(11, PortalRules.choose(Arrays.asList(placeA, placeB, department),
                Arrays.asList(answer("Площадка", "Пункт А"), answer("Отделение", "Пункт А")), parents).getAssetId());
    }

    @Test
    public void emptyChoiceDoesNotMatch() {
        PortalRuleDto place = rule(1, 10, condition("Площадка", "Пункт А"));
        PortalRules.Answer blank = new PortalRules.Answer("Площадка", "customfield_1", "customfield_1", "—", "");
        assertNull(PortalRules.choose(Collections.singletonList(place), Collections.singletonList(blank), Collections.<Integer, Integer>emptyMap()));
    }

    @Test
    public void optionIdMatchesAsWellAsTheLabel() {
        PortalRuleDto place = rule(1, 10, condition("customfield_10010", "10100"));
        PortalRules.Answer answer = new PortalRules.Answer("Площадка", "customfield_10010", "customfield_10010", "Пункт А", "10100");
        assertEquals(10, PortalRules.choose(Collections.singletonList(place), Collections.singletonList(answer),
                Collections.<Integer, Integer>emptyMap()).getAssetId());
    }

    private static PortalRules.Answer answer(String field, String option) {
        return new PortalRules.Answer(field, "customfield_1", "customfield_1", option, "1");
    }

    private static PortalRuleDto rule(int id, int assetId, PortalConditionDraft... conditions) {
        PortalRuleDto dto = new PortalRuleDto();
        dto.setId(id);
        dto.setAssetId(assetId);
        dto.setConditions(Arrays.asList(conditions));
        return dto;
    }

    private static PortalConditionDraft condition(String field, String option) {
        PortalConditionDraft draft = new PortalConditionDraft();
        draft.setField(field);
        draft.setOption(option);
        return draft;
    }
}
