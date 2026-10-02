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
