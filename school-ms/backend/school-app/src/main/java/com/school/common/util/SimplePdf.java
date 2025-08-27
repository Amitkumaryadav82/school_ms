package com.school.common.util;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Minimal PDF generator (no external deps). Produces a single-page PDF with
 * Helvetica text lines.
 */
public final class SimplePdf {
    private SimplePdf() {
    }

    public static byte[] generate(List<String> lines, String title) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            List<Integer> offsets = new ArrayList<>();

            // PDF header
            write(out, "%PDF-1.4\n");

            // 1: Catalog
            offsets.add(out.size());
            write(out, "1 0 obj\n");
            write(out, "<< /Type /Catalog /Pages 2 0 R >>\n");
            write(out, "endobj\n");

            // 2: Pages
            offsets.add(out.size());
            write(out, "2 0 obj\n");
            write(out, "<< /Type /Pages /Count 1 /Kids [3 0 R] >>\n");
            write(out, "endobj\n");

            // 3: Page
            offsets.add(out.size());
            write(out, "3 0 obj\n");
            write(out, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ");
            write(out, "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\n");
            write(out, "endobj\n");

            // 4: Font
            offsets.add(out.size());
            write(out, "4 0 obj\n");
            write(out, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n");
            write(out, "endobj\n");

            // 5: Contents
            // Build content stream
            String content = buildContent(lines, title);
            byte[] contentBytes = content.getBytes(StandardCharsets.US_ASCII);

            offsets.add(out.size());
            write(out, "5 0 obj\n");
            write(out, "<< /Length " + contentBytes.length + " >>\n");
            write(out, "stream\n");
            out.write(contentBytes);
            write(out, "\nendstream\n");
            write(out, "endobj\n");

            // xref
            int xrefStart = out.size();
            write(out, "xref\n");
            write(out, "0 6\n");
            write(out, String.format("%010d %05d f \n", 0, 65535));
            for (int off : offsets) {
                write(out, String.format("%010d %05d n \n", off, 0));
            }

            // trailer
            write(out, "trailer\n");
            write(out, "<< /Size 6 /Root 1 0 R >>\n");
            write(out, "startxref\n");
            write(out, Integer.toString(xrefStart));
            write(out, "\n%%EOF\n");

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private static String buildContent(List<String> lines, String title) {
        StringBuilder c = new StringBuilder();
        c.append("BT\n");
        // Title at top
        c.append("/F1 16 Tf\n");
        c.append(String.format(java.util.Locale.US, "1 0 0 1 50 %.2f Tm\n", 800f));
        c.append("(" + escape(title != null ? title : "Receipt") + ") Tj\n");
        // Body lines
        c.append("/F1 12 Tf\n");
        float yStart = 770f;
        float lineHeight = 18f;
        for (int i = 0; i < lines.size(); i++) {
            float y = yStart - i * lineHeight;
            c.append(String.format(java.util.Locale.US, "1 0 0 1 50 %.2f Tm\n", y));
            c.append("(" + escape(lines.get(i)) + ") Tj\n");
        }
        c.append("ET");
        return c.toString();
    }

    private static void write(ByteArrayOutputStream out, String s) throws Exception {
        out.write(s.getBytes(StandardCharsets.US_ASCII));
    }

    private static String escape(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }
}
