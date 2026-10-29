package com.mabini.sacode.dsa;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==================================================================
 *  DSA #3 — TRIE (prefix tree) for the search bars
 * ==================================================================
 *
 * Powers the "Search reports..." box on My Reports and the Equipment
 * search box, giving instant autocomplete without scanning every row.
 *
 * insert / search run in O(L), where L is the length of the term —
 * independent of how many reports or assets are stored.
 *
 * Each node stores its children in a {@link HashMap}, so a child lookup
 * costs O(1) on average and a walk costs O(L * 1).
 */
public class Trie {

    private static final int DEFAULT_LIMIT = 10;

    private static final class TrieNode {
        private final Map<Character, TrieNode> children = new HashMap<>();
        /** Terminating term exactly as it was inserted (casing preserved). */
        private String word;
        private int occurrences;
    }

    private final TrieNode root = new TrieNode();
    private int wordCount;

    /** O(L) — add (or count) a term. */
    public void insert(String term) {
        if (term == null || term.isBlank()) {
            return;
        }
        TrieNode node = root;
        for (char raw : normalise(term).toCharArray()) {
            node = node.children.computeIfAbsent(raw, key -> new TrieNode());
        }
        node.word = term.trim();
        node.occurrences++;
        wordCount++;
    }

    public void insertAll(Iterable<String> terms) {
        if (terms == null) {
            return;
        }
        for (String term : terms) {
            insert(term);
        }
    }

    /** O(L) — exact match. */
    public boolean contains(String term) {
        if (term == null || term.isBlank()) {
            return false;
        }
        TrieNode node = walk(normalise(term));
        return node != null && node.word != null;
    }

    /** O(L) — true when anything was stored with this prefix. */
    public boolean hasPrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return false;
        }
        return walk(normalise(prefix)) != null;
    }

    /** O(L + k) — up to {@code limit} completions for a partial term. */
    public List<String> autocomplete(String prefix, int limit) {
        List<String> results = new ArrayList<>();
        if (prefix == null || prefix.isBlank()) {
            return results;
        }
        String key = normalise(prefix);
        TrieNode start = walk(key);
        if (start == null) {
            return results;
        }
        collect(start, limit > 0 ? limit : DEFAULT_LIMIT, results);
        return results;
    }

    public List<String> autocomplete(String prefix) {
        return autocomplete(prefix, DEFAULT_LIMIT);
    }

    public int size() {
        return wordCount;
    }

    public void clear() {
        root.children.clear();
        root.word = null;
        root.occurrences = 0;
        wordCount = 0;
    }

    // -----------------------------------------------------------------

    private TrieNode walk(String normalised) {
        TrieNode node = root;
        for (char c : normalised.toCharArray()) {
            node = node.children.get(c);
            if (node == null) {
                return null;
            }
        }
        return node;
    }

    private void collect(TrieNode node, int limit, List<String> results) {
        if (results.size() >= limit) {
            return;
        }
        if (node.word != null) {
            results.add(node.word);
        }
        // stable ordering: alphabetical depth-first walk
        node.children.keySet().stream().sorted().forEach(character -> {
            if (results.size() < limit) {
                collect(node.children.get(character), limit, results);
            }
        });
    }

    private static String normalise(String value) {
        return value.trim().toLowerCase();
    }
}
