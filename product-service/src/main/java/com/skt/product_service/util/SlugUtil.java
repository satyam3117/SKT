package com.skt.product_service.util;


import java.util.Locale;


import java.text.Normalizer;
import java.util.Locale;

public final class SlugUtil {

    private SlugUtil() {
    }

    public static String normalize(String value) {

        if (value == null) {
            return null;
        }

        String normalized = Normalizer
                .normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        normalized = normalized
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");

        return normalized;
    }
}