package com.contactmanagement.util;

public class QueryUtils {

    /**
     * Escapes SQL LIKE wildcard characters in a search string
     * This prevents % and _ from being interpreted as wildcards
     */
    public static String escapeLikeWildcards(String input) {
        if (input == null) {
            return null;
        }
        return input.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}