package com.assetstree.jira.model;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;

/**
 * Equipment book in the Excel .xlsx package. Cells are written as text so a
 * place path or a key is not rewritten as a number. A date that Excel stored
 * as a serial is read back as yyyy-MM-dd.
 */
public final class WorkbookSheet {
    private static final int MAX_BYTES = 8_000_000;
    private static final int MAX_COLUMNS = 512;
    private static final long EXCEL_EPOCH = 25569L;

    private WorkbookSheet() {
    }

    public static byte[] write(List<String> headers, List<List<String>> rows) {
        try {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            ZipOutputStream zip = new ZipOutputStream(bytes);
            put(zip, "[Content_Types].xml", contentTypes());
            put(zip, "_rels/.rels", rootRels());
            put(zip, "xl/workbook.xml", workbook());
            put(zip, "xl/_rels/workbook.xml.rels", workbookRels());
            put(zip, "xl/styles.xml", styles());
            put(zip, "xl/worksheets/sheet1.xml", sheet(headers, rows));
            zip.close();
            return bytes.toByteArray();
        } catch (Exception ex) {
            throw new AssetException(500, "asset-tree.error.unexpected");
        }
    }

    public static EquipmentSheet.Sheet read(byte[] bytes) {
        if (bytes == null || bytes.length < 4) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        }
        if ((bytes[0] & 0xff) == 0xd0 && (bytes[1] & 0xff) == 0xcf) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        }
        if (bytes[0] != 'P' || bytes[1] != 'K') {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        }
        Map<String, byte[]> entries = unzip(bytes);
        byte[] shared = entries.get("xl/sharedStrings.xml");
        List<String> strings = shared == null ? new ArrayList<String>() : sharedStrings(shared);
        boolean[] dates = dateStyles(entries.get("xl/styles.xml"));
        byte[] sheet = sheetBytes(entries);
        if (sheet == null) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        }
        return rows(sheet, strings, dates);
    }

    private static void put(ZipOutputStream zip, String name, String xml) throws Exception {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(xml.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private static String contentTypes() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
                + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
                + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
                + "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>"
                + "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
                + "<Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/>"
                + "</Types>";
    }

    private static String rootRels() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>"
                + "</Relationships>";
    }

    private static String workbook() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                + "<sheets><sheet name=\"Equipment\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>";
    }

    private static String workbookRels() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/>"
                + "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>"
                + "</Relationships>";
    }

    private static String styles() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
                + "<fonts count=\"1\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts>"
                + "<fills count=\"2\"><fill><patternFill patternType=\"none\"/></fill><fill><patternFill patternType=\"gray125\"/></fill></fills>"
                + "<borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders>"
                + "<cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>"
                + "<cellXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/></cellXfs>"
                + "</styleSheet>";
    }

    private static String sheet(List<String> headers, List<List<String>> rows) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
        xml.append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>");
        writeRow(xml, 1, headers);
        if (rows != null) {
            int number = 2;
            for (List<String> row : rows) {
                writeRow(xml, number, row);
                number++;
            }
        }
        xml.append("</sheetData></worksheet>");
        return xml.toString();
    }

    private static void writeRow(StringBuilder xml, int number, List<String> cells) {
        xml.append("<row r=\"").append(number).append("\">");
        if (cells != null) {
            for (int i = 0; i < cells.size() && i < MAX_COLUMNS; i++) {
                xml.append("<c r=\"").append(columnName(i)).append(number).append("\" t=\"inlineStr\"><is><t xml:space=\"preserve\">");
                xml.append(escape(cells.get(i)));
                xml.append("</t></is></c>");
            }
        }
        xml.append("</row>");
    }

    private static String columnName(int index) {
        StringBuilder name = new StringBuilder();
        int n = index + 1;
        while (n > 0) {
            int rem = (n - 1) % 26;
            name.insert(0, (char) ('A' + rem));
            n = (n - 1) / 26;
        }
        return name.toString();
    }

    private static String escape(String value) {
        String text = value == null ? "" : value;
        StringBuilder out = new StringBuilder(text.length());
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch == '&') {
                out.append("&amp;");
            } else if (ch == '<') {
                out.append("&lt;");
            } else if (ch == '>') {
                out.append("&gt;");
            } else if (ch == '\t' || ch == '\n' || ch == '\r' || ch >= 0x20) {
                out.append(ch);
            }
        }
        return out.toString();
    }

    private static Map<String, byte[]> unzip(byte[] bytes) {
        Map<String, byte[]> entries = new HashMap<String, byte[]>();
        try {
            ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes));
            ZipEntry entry;
            long total = 0;
            byte[] buffer = new byte[8192];
            while ((entry = zip.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                int read;
                while ((read = zip.read(buffer)) >= 0) {
                    total += read;
                    if (total > MAX_BYTES) {
                        zip.close();
                        throw new AssetException(400, "asset-tree.error.import.workbook");
                    }
                    out.write(buffer, 0, read);
                }
                String name = entry.getName().replace('\\', '/');
                while (name.startsWith("/")) {
                    name = name.substring(1);
                }
                entries.put(name, out.toByteArray());
            }
            zip.close();
            return entries;
        } catch (AssetException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        }
    }

    private static byte[] sheetBytes(Map<String, byte[]> entries) {
        String target = firstSheet(entries.get("xl/workbook.xml"), entries.get("xl/_rels/workbook.xml.rels"));
        if (target != null && entries.containsKey(target)) {
            return entries.get(target);
        }
        byte[] direct = entries.get("xl/worksheets/sheet1.xml");
        if (direct != null) {
            return direct;
        }
        for (Map.Entry<String, byte[]> entry : entries.entrySet()) {
            if (entry.getKey().startsWith("xl/worksheets/") && entry.getKey().endsWith(".xml")) {
                return entry.getValue();
            }
        }
        return null;
    }

    private static String firstSheet(byte[] workbook, byte[] rels) {
        if (workbook == null || rels == null) {
            return null;
        }
        String relation = null;
        XMLStreamReader reader = reader(workbook);
        try {
            while (reader.hasNext()) {
                if (reader.next() == XMLStreamConstants.START_ELEMENT && "sheet".equals(reader.getLocalName())) {
                    relation = attr(reader, "id");
                    break;
                }
            }
        } catch (Exception ex) {
            return null;
        } finally {
            close(reader);
        }
        if (relation == null) {
            return null;
        }
        reader = reader(rels);
        try {
            while (reader.hasNext()) {
                if (reader.next() == XMLStreamConstants.START_ELEMENT && "Relationship".equals(reader.getLocalName())) {
                    if (relation.equals(attr(reader, "Id"))) {
                        return resolve(attr(reader, "Target"));
                    }
                }
            }
        } catch (Exception ex) {
            return null;
        } finally {
            close(reader);
        }
        return null;
    }

    private static String resolve(String target) {
        if (target == null || target.isEmpty()) {
            return null;
        }
        String path = target.replace('\\', '/');
        while (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.startsWith("xl/")) {
            return path;
        }
        return "xl/" + path;
    }

    private static List<String> sharedStrings(byte[] xml) {
        List<String> strings = new ArrayList<String>();
        XMLStreamReader reader = reader(xml);
        StringBuilder current = null;
        boolean inText = false;
        int skip = 0;
        try {
            while (reader.hasNext()) {
                int event = reader.next();
                if (event == XMLStreamConstants.START_ELEMENT) {
                    String name = reader.getLocalName();
                    if ("si".equals(name)) {
                        current = new StringBuilder();
                    } else if ("rPh".equals(name) || "phoneticPr".equals(name)) {
                        skip++;
                    } else if ("t".equals(name) && current != null && skip == 0) {
                        inText = true;
                    }
                } else if ((event == XMLStreamConstants.CHARACTERS || event == XMLStreamConstants.CDATA) && inText && current != null) {
                    current.append(reader.getText());
                } else if (event == XMLStreamConstants.END_ELEMENT) {
                    String name = reader.getLocalName();
                    if ("t".equals(name)) {
                        inText = false;
                    } else if ("rPh".equals(name) || "phoneticPr".equals(name)) {
                        if (skip > 0) {
                            skip--;
                        }
                    } else if ("si".equals(name)) {
                        strings.add(current == null ? "" : current.toString());
                        current = null;
                        inText = false;
                    }
                }
            }
        } catch (Exception ex) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        } finally {
            close(reader);
        }
        return strings;
    }

    private static boolean[] dateStyles(byte[] xml) {
        if (xml == null) {
            return new boolean[0];
        }
        List<Integer> formats = new ArrayList<Integer>();
        Map<Integer, String> custom = new HashMap<Integer, String>();
        boolean inXfs = false;
        XMLStreamReader reader = reader(xml);
        try {
            while (reader.hasNext()) {
                int event = reader.next();
                if (event == XMLStreamConstants.START_ELEMENT) {
                    String name = reader.getLocalName();
                    if ("numFmt".equals(name)) {
                        custom.put(Integer.valueOf(number(attr(reader, "numFmtId"))), attr(reader, "formatCode"));
                    } else if ("cellXfs".equals(name)) {
                        inXfs = true;
                    } else if (inXfs && "xf".equals(name)) {
                        formats.add(Integer.valueOf(number(attr(reader, "numFmtId"))));
                    }
                } else if (event == XMLStreamConstants.END_ELEMENT && "cellXfs".equals(reader.getLocalName())) {
                    inXfs = false;
                }
            }
        } catch (Exception ex) {
            return new boolean[0];
        } finally {
            close(reader);
        }
        boolean[] dates = new boolean[formats.size()];
        for (int i = 0; i < formats.size(); i++) {
            int format = formats.get(i).intValue();
            dates[i] = internalDate(format) || dateCode(custom.get(Integer.valueOf(format)));
        }
        return dates;
    }

    private static boolean internalDate(int format) {
        return (format >= 14 && format <= 22) || (format >= 27 && format <= 36)
                || (format >= 45 && format <= 47) || (format >= 50 && format <= 58);
    }

    private static boolean dateCode(String format) {
        if (format == null || format.isEmpty()) {
            return false;
        }
        StringBuilder plain = new StringBuilder();
        for (int i = 0; i < format.length(); i++) {
            char ch = format.charAt(i);
            if (ch == '\\' && i + 1 < format.length()) {
                i++;
                continue;
            }
            if (ch == '"') {
                i++;
                while (i < format.length() && format.charAt(i) != '"') {
                    i++;
                }
                continue;
            }
            if (ch == '[') {
                while (i < format.length() && format.charAt(i) != ']') {
                    i++;
                }
                continue;
            }
            plain.append(ch);
        }
        String code = plain.toString().toLowerCase(Locale.ROOT);
        if (code.indexOf('y') >= 0 || code.indexOf('d') >= 0 || code.indexOf('h') >= 0 || code.indexOf('s') >= 0) {
            return true;
        }
        for (int i = 0; i < code.length(); i++) {
            if (code.charAt(i) != 'm') {
                continue;
            }
            boolean minute = false;
            for (int left = i - 1; left >= 0; left--) {
                char prev = code.charAt(left);
                if (prev == 'h') {
                    minute = true;
                    break;
                }
                if (prev != 'm' && prev != ':') {
                    break;
                }
            }
            for (int right = i + 1; right < code.length(); right++) {
                char next = code.charAt(right);
                if (next == 's') {
                    minute = true;
                    break;
                }
                if (next != 'm' && next != ':') {
                    break;
                }
            }
            if (!minute) {
                return true;
            }
        }
        return false;
    }

    private static EquipmentSheet.Sheet rows(byte[] xml, List<String> strings, boolean[] dates) {
        List<String> headers = new ArrayList<String>();
        List<EquipmentSheet.Record> records = new ArrayList<EquipmentSheet.Record>();
        XMLStreamReader reader = reader(xml);
        try {
            while (reader.hasNext()) {
                if (reader.next() == XMLStreamConstants.START_ELEMENT && "row".equals(reader.getLocalName())) {
                    int rowNumber = number(attr(reader, "r"));
                    List<String> cells = readRow(reader, strings, dates);
                    if (blank(cells)) {
                        continue;
                    }
                    if (headers.isEmpty()) {
                        for (String cell : cells) {
                            headers.add(cell == null ? "" : cell.trim());
                        }
                    } else {
                        records.add(new EquipmentSheet.Record(rowNumber > 0 ? rowNumber : records.size() + 2, cells));
                    }
                }
            }
        } catch (AssetException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        } finally {
            close(reader);
        }
        return new EquipmentSheet.Sheet(headers, records);
    }

    private static List<String> readRow(XMLStreamReader reader, List<String> strings, boolean[] dates) throws Exception {
        String[] cells = new String[0];
        int next = 0;
        int depth = 1;
        while (depth > 0 && reader.hasNext()) {
            int event = reader.next();
            if (event == XMLStreamConstants.START_ELEMENT) {
                if (depth == 1 && "c".equals(reader.getLocalName())) {
                    int column = columnIndex(attr(reader, "r"));
                    if (column < 0) {
                        column = next;
                    }
                    String type = attr(reader, "t");
                    String styleAttr = attr(reader, "s");
                    int style = styleAttr == null ? -1 : number(styleAttr);
                    String value = readCell(reader, type, style, strings, dates);
                    if (column >= 0 && column < MAX_COLUMNS) {
                        if (column >= cells.length) {
                            String[] grown = new String[column + 1];
                            System.arraycopy(cells, 0, grown, 0, cells.length);
                            cells = grown;
                        }
                        cells[column] = value;
                        next = column + 1;
                    }
                } else {
                    depth++;
                }
            } else if (event == XMLStreamConstants.END_ELEMENT) {
                depth--;
            }
        }
        List<String> row = new ArrayList<String>();
        for (int i = 0; i < cells.length; i++) {
            row.add(cells[i] == null ? "" : cells[i]);
        }
        return row;
    }

    private static String readCell(XMLStreamReader reader, String type, int style, List<String> strings, boolean[] dates) throws Exception {
        StringBuilder text = new StringBuilder();
        StringBuilder value = new StringBuilder();
        boolean inText = false;
        boolean inValue = false;
        int depth = 1;
        while (depth > 0 && reader.hasNext()) {
            int event = reader.next();
            if (event == XMLStreamConstants.START_ELEMENT) {
                depth++;
                String name = reader.getLocalName();
                if ("t".equals(name)) {
                    inText = true;
                } else if ("v".equals(name)) {
                    inValue = true;
                }
            } else if ((event == XMLStreamConstants.CHARACTERS || event == XMLStreamConstants.CDATA)) {
                if (inText) {
                    text.append(reader.getText());
                } else if (inValue) {
                    value.append(reader.getText());
                }
            } else if (event == XMLStreamConstants.END_ELEMENT) {
                String name = reader.getLocalName();
                if ("t".equals(name)) {
                    inText = false;
                } else if ("v".equals(name)) {
                    inValue = false;
                }
                depth--;
            }
        }
        if ("inlineStr".equals(type) || text.length() > 0 && "s".equals(type) == false && value.length() == 0) {
            return text.toString();
        }
        String raw = value.toString().trim();
        if ("s".equals(type)) {
            int index = number(raw);
            return index >= 0 && index < strings.size() ? strings.get(index) : "";
        }
        if ("b".equals(type)) {
            return "1".equals(raw) ? "true" : "false";
        }
        if ("str".equals(type)) {
            return raw;
        }
        if (raw.isEmpty()) {
            return text.toString();
        }
        boolean date = style >= 0 && style < dates.length && dates[style];
        return date ? excelDate(raw) : plainNumber(raw);
    }

    private static String excelDate(String raw) {
        try {
            double serial = Double.parseDouble(raw);
            long days = (long) Math.floor(serial + 1e-8);
            if (days <= 0) {
                return plainNumber(raw);
            }
            return LocalDate.ofEpochDay(days - EXCEL_EPOCH).toString();
        } catch (RuntimeException ex) {
            return raw;
        }
    }

    private static String plainNumber(String raw) {
        try {
            double value = Double.parseDouble(raw);
            if (Double.isInfinite(value) || Double.isNaN(value)) {
                return raw;
            }
            if (Math.abs(value) < 1e15 && Math.abs(value - Math.rint(value)) < 1e-6) {
                return Long.toString((long) Math.rint(value));
            }
            return raw;
        } catch (NumberFormatException ex) {
            return raw;
        }
    }

    private static boolean blank(List<String> cells) {
        for (String cell : cells) {
            if (cell != null && !cell.trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private static int columnIndex(String ref) {
        if (ref == null) {
            return -1;
        }
        int column = 0;
        int used = 0;
        for (int i = 0; i < ref.length(); i++) {
            char ch = ref.charAt(i);
            if (ch >= 'A' && ch <= 'Z') {
                column = column * 26 + (ch - 'A' + 1);
                used++;
            } else if (ch >= 'a' && ch <= 'z') {
                column = column * 26 + (ch - 'a' + 1);
                used++;
            } else {
                break;
            }
        }
        return used == 0 ? -1 : column - 1;
    }

    private static int number(String raw) {
        if (raw == null || raw.isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private static String attr(XMLStreamReader reader, String local) {
        for (int i = 0; i < reader.getAttributeCount(); i++) {
            if (local.equals(reader.getAttributeLocalName(i))) {
                return reader.getAttributeValue(i);
            }
        }
        return null;
    }

    private static XMLStreamReader reader(byte[] xml) {
        try {
            XMLInputFactory factory = XMLInputFactory.newFactory();
            factory.setProperty(XMLInputFactory.SUPPORT_DTD, Boolean.FALSE);
            factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, Boolean.FALSE);
            return factory.createXMLStreamReader(new ByteArrayInputStream(xml), "UTF-8");
        } catch (Exception ex) {
            throw new AssetException(400, "asset-tree.error.import.workbook");
        }
    }

    private static void close(XMLStreamReader reader) {
        if (reader == null) {
            return;
        }
        try {
            reader.close();
        } catch (Exception ignored) {
            // The sheet is already in memory.
        }
    }
}
