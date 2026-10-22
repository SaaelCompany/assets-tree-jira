package com.assetstree.jira.model;

/**
 * Checks that stored lab documents are one well-formed JSON object, so the page never
 * receives a body it cannot parse. Values are not interpreted.
 */
public final class JsonCheck {
    private static final int MAX_DEPTH = 40;

    private final String text;
    private int at;

    private JsonCheck(String text) {
        this.text = text;
    }

    public static boolean isObject(String text) {
        if (text == null) {
            return false;
        }
        JsonCheck check = new JsonCheck(text);
        try {
            check.space();
            if (!check.peek('{')) {
                return false;
            }
            check.value(0);
            check.space();
            return check.at == text.length();
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private void value(int depth) {
        if (depth > MAX_DEPTH) {
            throw new IllegalArgumentException("depth");
        }
        space();
        char c = current();
        if (c == '{') {
            object(depth);
        } else if (c == '[') {
            array(depth);
        } else if (c == '"') {
            string();
        } else if (c == 't') {
            word("true");
        } else if (c == 'f') {
            word("false");
        } else if (c == 'n') {
            word("null");
        } else {
            number();
        }
    }

    private void object(int depth) {
        at++;
        space();
        if (peek('}')) {
            at++;
            return;
        }
        while (true) {
            space();
            if (current() != '"') {
                throw new IllegalArgumentException("key");
            }
            string();
            space();
            expect(':');
            value(depth + 1);
            space();
            if (peek(',')) {
                at++;
                continue;
            }
            expect('}');
            return;
        }
    }

    private void array(int depth) {
        at++;
        space();
        if (peek(']')) {
            at++;
            return;
        }
        while (true) {
            value(depth + 1);
            space();
            if (peek(',')) {
                at++;
                continue;
            }
            expect(']');
            return;
        }
    }

    private void string() {
        at++;
        while (true) {
            char c = current();
            at++;
            if (c == '"') {
                return;
            }
            if (c < 0x20) {
                throw new IllegalArgumentException("control");
            }
            if (c == '\\') {
                char e = current();
                at++;
                if (e == 'u') {
                    for (int i = 0; i < 4; i++) {
                        if (Character.digit(current(), 16) < 0) {
                            throw new IllegalArgumentException("escape");
                        }
                        at++;
                    }
                } else if ("\"\\/bfnrt".indexOf(e) < 0) {
                    throw new IllegalArgumentException("escape");
                }
            }
        }
    }

    private void number() {
        int start = at;
        if (peek('-')) {
            at++;
        }
        int digits = digits();
        if (digits == 0) {
            throw new IllegalArgumentException("number");
        }
        if (peek('.')) {
            at++;
            if (digits() == 0) {
                throw new IllegalArgumentException("number");
            }
        }
        if (peek('e') || peek('E')) {
            at++;
            if (peek('+') || peek('-')) {
                at++;
            }
            if (digits() == 0) {
                throw new IllegalArgumentException("number");
            }
        }
        if (at == start) {
            throw new IllegalArgumentException("number");
        }
    }

    private int digits() {
        int count = 0;
        while (at < text.length() && Character.isDigit(text.charAt(at)) && text.charAt(at) < 128) {
            at++;
            count++;
        }
        return count;
    }

    private void word(String word) {
        if (!text.startsWith(word, at)) {
            throw new IllegalArgumentException("word");
        }
        at += word.length();
    }

    private void expect(char c) {
        if (!peek(c)) {
            throw new IllegalArgumentException("expected " + c);
        }
        at++;
    }

    private boolean peek(char c) {
        return at < text.length() && text.charAt(at) == c;
    }

    private char current() {
        if (at >= text.length()) {
            throw new IllegalArgumentException("end");
        }
        return text.charAt(at);
    }

    private void space() {
        while (at < text.length()) {
            char c = text.charAt(at);
            if (c == ' ' || c == '\n' || c == '\r' || c == '\t') {
                at++;
            } else {
                return;
            }
        }
    }
}
