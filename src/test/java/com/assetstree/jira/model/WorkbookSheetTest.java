package com.assetstree.jira.model;

import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class WorkbookSheetTest {
    @Test
    public void textRoundTripKeepsPathsAndLineBreaks() {
        List<String> headers = Arrays.asList("Ключ", "Название", "Площадка", "Описание", "Серийный");
        List<List<String>> rows = new ArrayList<List<String>>();
        rows.add(Arrays.asList("AST-4", "Canon & 2035", "Усть-Лабинск / Кабинет 1", "линия\nвторая", "SN;1"));
        EquipmentSheet.Sheet sheet = WorkbookSheet.read(WorkbookSheet.write(headers, rows));
        assertEquals(headers, sheet.getHeaders());
        assertEquals(1, sheet.getRecords().size());
        assertEquals(2, sheet.getRecords().get(0).getRow());
        assertEquals("Canon & 2035", sheet.getRecords().get(0).cell(1));
        assertEquals("Усть-Лабинск / Кабинет 1", sheet.getRecords().get(0).cell(2));
        assertEquals("линия\nвторая", sheet.getRecords().get(0).cell(3));
        assertEquals("SN;1", sheet.getRecords().get(0).cell(4));
    }

    @Test
    public void sharedStringsAndExcelDatesComeBackAsText() throws Exception {
        long serial = LocalDate.of(2024, 3, 15).toEpochDay() + 25569L;
        String shared = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<sst xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" count=\"4\" uniqueCount=\"4\">"
                + "<si><t>Название</t></si><si><t>Ввод</t></si><si><t>Инвентарный</t></si><si><t>Новый</t></si></sst>";
        String styles = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
                + "<cellXfs count=\"2\"><xf numFmtId=\"0\"/><xf numFmtId=\"14\"/></cellXfs></styleSheet>";
        String sheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>"
                + "<row r=\"1\"><c r=\"A1\" t=\"s\"><v>0</v></c><c r=\"B1\" t=\"s\"><v>1</v></c><c r=\"C1\" t=\"s\"><v>2</v></c></row>"
                + "<row r=\"2\"><c r=\"A2\" t=\"s\"><v>3</v></c><c r=\"B2\" s=\"1\"><v>" + serial + "</v></c><c r=\"C2\"><v>15</v></c></row>"
                + "</sheetData></worksheet>";
        EquipmentSheet.Sheet read = WorkbookSheet.read(pack(shared, styles, sheet));
        assertEquals(Arrays.asList("Название", "Ввод", "Инвентарный"), read.getHeaders());
        assertEquals("Новый", read.getRecords().get(0).cell(0));
        assertEquals("2024-03-15", read.getRecords().get(0).cell(1));
        assertEquals("15", read.getRecords().get(0).cell(2));
        assertEquals(2, read.getRecords().get(0).getRow());
    }

    @Test
    public void namedSheetReadsEscapedSharedText() throws Exception {
        String workbook = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<workbook xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                + "<sheets><sheet name=\"Equipment\" sheetId=\"1\" r:id=\"rId9\"/></sheets></workbook>";
        String rels = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<Relationships><Relationship Id=\"rId9\" Target=\"worksheets/sheet2.xml\"/></Relationships>";
        String shared = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><sst><si><t>A &amp; B&#10;C</t>"
                + "<rPh sb=\"0\" eb=\"1\"><t>skip</t></rPh></si></sst>";
        String sheet = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><worksheet><sheetData>"
                + "<row r=\"1\"><c r=\"A1\" t=\"s\"><v>0</v></c></row>"
                + "<row r=\"2\"><c r=\"A2\" t=\"inlineStr\"><is><t>ok</t></is></c></row>"
                + "</sheetData></worksheet>";
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(bytes);
        entry(zip, "xl/workbook.xml", workbook);
        entry(zip, "xl/_rels/workbook.xml.rels", rels);
        entry(zip, "xl/sharedStrings.xml", shared);
        entry(zip, "xl/worksheets/sheet2.xml", sheet);
        zip.close();
        EquipmentSheet.Sheet read = WorkbookSheet.read(bytes.toByteArray());
        assertEquals("A & B\nC", read.getHeaders().get(0));
        assertEquals("ok", read.getRecords().get(0).cell(0));
    }

    @Test
    public void documentTypeIsRejected() throws Exception {
        String sheet = "<?xml version=\"1.0\"?><!DOCTYPE worksheet [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>"
                + "<worksheet><sheetData><row r=\"1\"><c r=\"A1\" t=\"inlineStr\"><is><t>&xxe;</t></is></c></row></sheetData></worksheet>";
        try {
            WorkbookSheet.read(pack("", "", sheet));
            fail("doctype");
        } catch (AssetException ex) {
            assertEquals("asset-tree.error.import.workbook", ex.getMessageKey());
        }
    }

    @Test
    public void oldExcelFormatIsRejected() {
        try {
            WorkbookSheet.read(new byte[] {(byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0, 0, 0});
            fail("old workbook");
        } catch (AssetException ex) {
            assertEquals("asset-tree.error.import.workbook", ex.getMessageKey());
        }
    }

    @Test
    public void plannedWorkbookCreatesFromABlankKey() {
        List<String> headers = Arrays.asList("Название", "Тип", "Площадка", "Ввод");
        List<List<String>> rows = new ArrayList<List<String>>();
        rows.add(Arrays.asList("Новый", "Принтер", "Филиал", "15.03.2024"));
        EquipmentExchange.Plan plan = EquipmentExchange.plan(WorkbookSheet.read(WorkbookSheet.write(headers, rows)),
                catalog(), Collections.singletonList(new EquipmentExchange.Named("in_use", "В эксплуатации")),
                Collections.singletonList(new EquipmentExchange.Node(1, null, "Филиал", "AST-1", true)),
                "in_use", Collections.<String, String>emptyMap(), new EquipmentExchange.Directory() {
                    @Override
                    public EquipmentExchange.Person find(String raw) {
                        return EquipmentExchange.Person.blank();
                    }
                });
        assertEquals(1, plan.getChanges().size());
        assertEquals("Новый", plan.getChanges().get(0).getName());
        assertEquals("2024-03-15", plan.getChanges().get(0).getAttributes().get(0).getValue());
    }

    @Test
    public void eachTypeKeepsItsOwnSheetAndFields() {
        List<List<String>> printers = new ArrayList<List<String>>();
        printers.add(Arrays.asList("", "Canon", "Принтер", "Филиал", "SN-P"));
        List<List<String>> laptops = new ArrayList<List<String>>();
        laptops.add(Arrays.asList("", "ThinkPad", "", "Филиал", "SN-L"));
        List<WorkbookSheet.Page> pages = new ArrayList<WorkbookSheet.Page>();
        pages.add(new WorkbookSheet.Page("Принтер", Arrays.asList("Ключ", "Название", "Тип", "Площадка", "Серийный"), printers));
        pages.add(new WorkbookSheet.Page("Ноутбук", Arrays.asList("Ключ", "Название", "Тип", "Площадка", "Серийный"), laptops));
        pages.add(new WorkbookSheet.Page("Монитор", Arrays.asList("Ключ", "Название", "Тип", "Площадка", "Диагональ"), new ArrayList<List<String>>()));
        List<EquipmentSheet.Sheet> sheets = WorkbookSheet.readAll(WorkbookSheet.write(pages));
        assertEquals(3, sheets.size());
        assertEquals("Принтер", sheets.get(0).getName());
        assertEquals("Ноутбук", sheets.get(1).getName());
        assertEquals("Монитор", sheets.get(2).getName());
        assertEquals("SN-P", sheets.get(0).getRecords().get(0).cell(4));
        assertEquals(0, sheets.get(2).getRecords().size());
        EquipmentExchange.Plan plan = EquipmentExchange.planBook(sheets, twoTypes(),
                Collections.singletonList(new EquipmentExchange.Named("in_use", "В эксплуатации")),
                Collections.singletonList(new EquipmentExchange.Node(1, null, "Филиал", "AST-1", true)),
                "in_use", Collections.<String, String>emptyMap(), blankPeople());
        assertEquals(0, plan.getIssues().size());
        assertEquals(2, plan.getChanges().size());
        assertEquals("printer", plan.getChanges().get(0).getTypeKey());
        assertEquals("serial-printer", plan.getChanges().get(0).getAttributes().get(0).getFieldKey());
        assertEquals("SN-P", plan.getChanges().get(0).getAttributes().get(0).getValue());
        assertEquals("laptop", plan.getChanges().get(1).getTypeKey());
        assertEquals("serial-laptop", plan.getChanges().get(1).getAttributes().get(0).getFieldKey());
        assertEquals("SN-L", plan.getChanges().get(1).getAttributes().get(0).getValue());
    }

    @Test
    public void sheetNameDropsCharactersExcelRejects() {
        assertEquals("Принтер МФУ", WorkbookSheet.sheetTitle("Принтер/МФУ"));
        List<WorkbookSheet.Page> pages = new ArrayList<WorkbookSheet.Page>();
        pages.add(new WorkbookSheet.Page("Принтер/МФУ", Arrays.asList("Название"), Collections.singletonList(Arrays.asList("Один"))));
        pages.add(new WorkbookSheet.Page("Принтер/МФУ", Arrays.asList("Название"), Collections.singletonList(Arrays.asList("Два"))));
        List<EquipmentSheet.Sheet> sheets = WorkbookSheet.readAll(WorkbookSheet.write(pages));
        assertEquals("Принтер МФУ", sheets.get(0).getName());
        assertEquals("Принтер МФУ (2)", sheets.get(1).getName());
    }

    @Test
    public void oldSingleSheetStillUsesTheTypeColumn() {
        List<String> headers = Arrays.asList("Название", "Тип", "Площадка", "Серийный");
        List<List<String>> rows = new ArrayList<List<String>>();
        rows.add(Arrays.asList("Новый", "Принтер", "Филиал", "SN-P"));
        EquipmentExchange.Plan plan = EquipmentExchange.planBook(WorkbookSheet.readAll(WorkbookSheet.write(headers, rows)),
                twoTypes(), Collections.singletonList(new EquipmentExchange.Named("in_use", "В эксплуатации")),
                Collections.singletonList(new EquipmentExchange.Node(1, null, "Филиал", "AST-1", true)),
                "in_use", Collections.<String, String>emptyMap(), blankPeople());
        assertEquals(1, plan.getChanges().size());
        assertEquals("printer", plan.getChanges().get(0).getTypeKey());
        assertEquals("serial-printer", plan.getChanges().get(0).getAttributes().get(0).getFieldKey());
    }

    @Test
    public void rowTypeMustMatchItsSheet() {
        List<WorkbookSheet.Page> pages = new ArrayList<WorkbookSheet.Page>();
        pages.add(new WorkbookSheet.Page("Принтер", Arrays.asList("Название", "Тип", "Площадка"),
                Collections.singletonList(Arrays.asList("Чужой", "Ноутбук", "Филиал"))));
        pages.add(new WorkbookSheet.Page("Ноутбук", Arrays.asList("Ключ", "Название", "Тип", "Площадка"),
                Arrays.asList(Arrays.asList("AST-9", "Первый", "Ноутбук", "Филиал"),
                        Arrays.asList("AST-9", "Второй", "Ноутбук", "Филиал"))));
        EquipmentExchange.Plan plan = EquipmentExchange.planBook(WorkbookSheet.readAll(WorkbookSheet.write(pages)),
                twoTypes(), Collections.singletonList(new EquipmentExchange.Named("in_use", "В эксплуатации")),
                Collections.singletonList(new EquipmentExchange.Node(1, null, "Филиал", "AST-1", true)),
                "in_use", Collections.<String, String>emptyMap(), blankPeople());
        assertEquals(0, plan.getChanges().size());
        assertEquals(3, plan.getIssues().size());
        assertEquals("asset-tree.error.import.sheet.type", plan.getIssues().get(0).getMessageKey());
        assertEquals("Принтер", plan.getIssues().get(0).getSheet());
        assertEquals("asset-tree.error.import.key", plan.getIssues().get(1).getMessageKey());
        assertEquals("asset-tree.error.import.key.duplicate", plan.getIssues().get(2).getMessageKey());
    }

    @Test
    public void headerOnlySheetsDoNotRejectABookWithRows() {
        List<WorkbookSheet.Page> pages = new ArrayList<WorkbookSheet.Page>();
        pages.add(new WorkbookSheet.Page("Монитор", Arrays.asList("Название", "Тип", "Площадка"), new ArrayList<List<String>>()));
        pages.add(new WorkbookSheet.Page("Принтер", Arrays.asList("Название", "Тип", "Площадка"),
                Collections.singletonList(Arrays.asList("Новый", "", "Филиал"))));
        EquipmentExchange.Plan plan = EquipmentExchange.planBook(WorkbookSheet.readAll(WorkbookSheet.write(pages)),
                twoTypes(), Collections.singletonList(new EquipmentExchange.Named("in_use", "В эксплуатации")),
                Collections.singletonList(new EquipmentExchange.Node(1, null, "Филиал", "AST-1", true)),
                "in_use", Collections.<String, String>emptyMap(), blankPeople());
        assertEquals(1, plan.getChanges().size());
        assertEquals("printer", plan.getChanges().get(0).getTypeKey());
        assertTrue(plan.getIssues().isEmpty());
    }

    private static List<EquipmentExchange.TypeRef> twoTypes() {
        List<EquipmentExchange.TypeRef> types = new ArrayList<EquipmentExchange.TypeRef>();
        types.add(new EquipmentExchange.TypeRef("printer", "Принтер", false,
                Collections.singletonList(new EquipmentExchange.FieldRef("serial-printer", "Серийный", "text", false))));
        types.add(new EquipmentExchange.TypeRef("laptop", "Ноутбук", false,
                Collections.singletonList(new EquipmentExchange.FieldRef("serial-laptop", "Серийный", "text", false))));
        return types;
    }

    private static EquipmentExchange.Directory blankPeople() {
        return new EquipmentExchange.Directory() {
            @Override
            public EquipmentExchange.Person find(String raw) {
                return EquipmentExchange.Person.blank();
            }
        };
    }

    private static List<EquipmentExchange.TypeRef> catalog() {
        List<EquipmentExchange.FieldRef> fields = new ArrayList<EquipmentExchange.FieldRef>();
        fields.add(new EquipmentExchange.FieldRef("commissioned", "Ввод", "date", false));
        return Collections.singletonList(new EquipmentExchange.TypeRef("printer", "Принтер", false, fields));
    }

    private static byte[] pack(String shared, String styles, String sheet) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(bytes);
        entry(zip, "xl/sharedStrings.xml", shared);
        entry(zip, "xl/styles.xml", styles);
        entry(zip, "xl/worksheets/sheet1.xml", sheet);
        zip.close();
        return bytes.toByteArray();
    }

    private static void entry(ZipOutputStream zip, String name, String xml) throws Exception {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(xml.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }
}
