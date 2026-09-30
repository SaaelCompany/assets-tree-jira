package com.assetstree.jira.model;

import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class EquipmentExchangeTest {
    @Test
    public void sheetRoundTripKeepsQuotesAndSemicolons() {
        List<String> headers = Arrays.asList("Ключ", "Название", "Тип", "Статус", "Площадка", "Ответственный", "Описание", "Серийный номер");
        List<List<String>> rows = new ArrayList<List<String>>();
        rows.add(Arrays.asList("AST-4", "Canon 2035", "Принтер", "В эксплуатации", "Усть-Лабинск / Кабинет 1", "Иванов Сергей", "линия\nвторая", "SN;1"));
        EquipmentSheet.Sheet sheet = EquipmentSheet.read(EquipmentSheet.write(headers, rows));
        assertEquals(headers, sheet.getHeaders());
        assertEquals(1, sheet.getRecords().size());
        assertEquals("Canon 2035", sheet.getRecords().get(0).cell(1));
        assertEquals("Усть-Лабинск / Кабинет 1", sheet.getRecords().get(0).cell(4));
        assertEquals("линия\nвторая", sheet.getRecords().get(0).cell(6));
        assertEquals("SN;1", sheet.getRecords().get(0).cell(7));
    }

    @Test
    public void commaFileAndBlankKeyCreateWhileFilledKeyUpdates() {
        String csv = "Key,Name,Type,Status,Place,Custodian,Serial\n"
                + ",Новый,Принтер,В эксплуатации,Филиал / Кабинет,ivanov,A-1\n"
                + "AST-4,Canon,Принтер,,Филиал / Кабинет,,A-2\n"
                + ",Чужой,Принтер,,Нет такого,,\n"
                + "AST-9,Нет ключа,Принтер,,Филиал,,\n";
        EquipmentExchange.Plan plan = EquipmentExchange.plan(EquipmentSheet.read(csv), catalogTypes(), catalogStatuses(), catalogNodes(),
                "in_use", Collections.<String, String>emptyMap(), directory());
        assertEquals(2, plan.getChanges().size());
        EquipmentExchange.Change created = plan.getChanges().get(0);
        assertNull(created.getExistingId());
        assertEquals("Новый", created.getName());
        assertEquals("printer", created.getTypeKey());
        assertEquals("in_use", created.getStatusKey());
        assertEquals(2, created.getParentId());
        assertEquals("ivanov", created.getCustodianKey());
        assertEquals("A-1", created.getAttributes().get(0).getValue());
        EquipmentExchange.Change updated = plan.getChanges().get(1);
        assertEquals(Integer.valueOf(4), updated.getExistingId());
        assertEquals("in_use", updated.getStatusKey());
        assertNull(updated.getDescription());
        assertTrue(updated.isCustodianPresent());
        assertNull(updated.getCustodianKey());
        assertEquals(2, plan.getIssues().size());
        assertEquals("asset-tree.error.import.place", plan.getIssues().get(0).getMessageKey());
        assertEquals(4, plan.getIssues().get(0).getRow());
        assertEquals("asset-tree.error.import.key", plan.getIssues().get(1).getMessageKey());
        assertEquals(5, plan.getIssues().get(1).getRow());
    }

    @Test
    public void repeatedKeyAndPlaceTypeAreRejected() {
        String csv = "Название;Тип;Площадка;Ключ\n"
                + "Один;Принтер;Филиал;AST-4\n"
                + "Два;Принтер;Филиал;AST-4\n"
                + "Три;Филиал;Филиал;\n";
        EquipmentExchange.Plan plan = EquipmentExchange.plan(EquipmentSheet.read(csv), catalogTypes(), catalogStatuses(), catalogNodes(),
                "in_use", Collections.<String, String>emptyMap(), directory());
        assertEquals(1, plan.getChanges().size());
        assertEquals("asset-tree.error.import.key.duplicate", plan.getIssues().get(0).getMessageKey());
        assertEquals("asset-tree.error.import.type.place", plan.getIssues().get(1).getMessageKey());
    }

    @Test
    public void requiredFieldAndBadNumberStayOut() {
        String csv = "Название;Тип;Площадка;Инвентарный\n"
                + "Без номера;Принтер;Филиал;\n"
                + "Плохой;Принтер;Филиал;abc\n";
        List<EquipmentExchange.FieldRef> fields = new ArrayList<EquipmentExchange.FieldRef>();
        fields.add(new EquipmentExchange.FieldRef("inventory", "Инвентарный", "number", true));
        List<EquipmentExchange.TypeRef> types = new ArrayList<EquipmentExchange.TypeRef>();
        types.add(new EquipmentExchange.TypeRef("printer", "Принтер", false, fields));
        EquipmentExchange.Plan plan = EquipmentExchange.plan(EquipmentSheet.read(csv), types, catalogStatuses(), catalogNodes(),
                "in_use", Collections.<String, String>emptyMap(), directory());
        assertTrue(plan.getChanges().isEmpty());
        assertEquals("asset-tree.error.import.field.required", plan.getIssues().get(0).getMessageKey());
        assertEquals("asset-tree.error.import.number", plan.getIssues().get(1).getMessageKey());
    }

    private static List<EquipmentExchange.TypeRef> catalogTypes() {
        List<EquipmentExchange.FieldRef> fields = new ArrayList<EquipmentExchange.FieldRef>();
        fields.add(new EquipmentExchange.FieldRef("serial", "Серийный номер", "text", false));
        fields.add(new EquipmentExchange.FieldRef("inventory", "Инвентарный", "number", false));
        List<EquipmentExchange.TypeRef> types = new ArrayList<EquipmentExchange.TypeRef>();
        types.add(new EquipmentExchange.TypeRef("branch", "Филиал", true, Collections.<EquipmentExchange.FieldRef>emptyList()));
        types.add(new EquipmentExchange.TypeRef("printer", "Принтер", false, fields));
        return types;
    }

    private static List<EquipmentExchange.Named> catalogStatuses() {
        return Collections.singletonList(new EquipmentExchange.Named("in_use", "В эксплуатации"));
    }

    private static List<EquipmentExchange.Node> catalogNodes() {
        List<EquipmentExchange.Node> nodes = new ArrayList<EquipmentExchange.Node>();
        nodes.add(new EquipmentExchange.Node(1, null, "Филиал", "AST-1", true));
        nodes.add(new EquipmentExchange.Node(2, Integer.valueOf(1), "Кабинет", "AST-2", true));
        nodes.add(new EquipmentExchange.Node(3, Integer.valueOf(2), "Стол", "AST-3", true));
        nodes.add(new EquipmentExchange.Node(4, Integer.valueOf(3), "Canon", "AST-4", false));
        return nodes;
    }

    private static EquipmentExchange.Directory directory() {
        final Map<String, String> users = new LinkedHashMap<String, String>();
        users.put("ivanov", "ivanov");
        users.put("иванов сергей", "ivanov");
        return new EquipmentExchange.Directory() {
            @Override
            public EquipmentExchange.Person find(String raw) {
                String key = users.get(EquipmentExchange.norm(raw));
                return key == null ? EquipmentExchange.Person.missing() : EquipmentExchange.Person.found(key);
            }
        };
    }
}
