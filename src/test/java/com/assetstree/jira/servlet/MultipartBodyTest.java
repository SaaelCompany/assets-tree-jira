package com.assetstree.jira.servlet;

import org.junit.Test;

import java.nio.charset.Charset;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class MultipartBodyTest {
    private static final Charset LATIN = Charset.forName("ISO-8859-1");

    @Test
    public void readsPdfBytesAndUtf8Name() {
        byte[] pdf = join(
                "%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\r\n--still-inside-the-file\n1 0 obj".getBytes(LATIN)
        );
        String boundary = "----PdfBoundary7";
        String head = "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"act.pdf\"; filename*=UTF-8''%D0%B0%D0%BA%D1%82.pdf\r\n"
                + "Content-Type: application/pdf\r\n\r\n";
        String tail = "\r\n--" + boundary + "--\r\n";
        byte[] body = join(head.getBytes(LATIN), pdf, tail.getBytes(LATIN));

        MultipartBody.FilePart part = MultipartBody.firstFile(body, "multipart/form-data; boundary=" + boundary);

        assertNotNull(part);
        assertEquals("акт.pdf", part.getFileName());
        assertEquals("application/pdf", part.getContentType());
        assertArrayEquals(pdf, part.getData());
    }

    @Test
    public void skipsATextFieldBeforeTheFile() {
        String boundary = "----Bound";
        String body = "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"note\"\r\n\r\n"
                + "hello\r\n"
                + "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"scan.pdf\"\r\n"
                + "Content-Type: application/pdf\r\n\r\n"
                + "%PDF"
                + "\r\n--" + boundary + "--\r\n";

        MultipartBody.FilePart part = MultipartBody.firstFile(body.getBytes(LATIN), "multipart/form-data; boundary=\"" + boundary + "\"");

        assertNotNull(part);
        assertEquals("scan.pdf", part.getFileName());
        assertArrayEquals("%PDF".getBytes(LATIN), part.getData());
    }

    private static byte[] join(byte[]... parts) {
        int size = 0;
        for (byte[] part : parts) {
            size += part.length;
        }
        byte[] all = new byte[size];
        int offset = 0;
        for (byte[] part : parts) {
            System.arraycopy(part, 0, all, offset, part.length);
            offset += part.length;
        }
        return all;
    }
}
