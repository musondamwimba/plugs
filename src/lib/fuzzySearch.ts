/**
 * Simple fuzzy search implementation that handles:
 * - Typos and misspellings
 * - Incorrect spacing
 * - Case insensitivity
 */

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }
  
  return dp[m][n];
}

// Normalize string: lowercase, remove extra spaces, remove special characters
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if a word is similar to another (within threshold)
function isSimilarWord(word1: string, word2: string, threshold: number = 2): boolean {
  if (word2.includes(word1) || word1.includes(word2)) return true;
  
  const distance = levenshteinDistance(word1, word2);
  const maxLength = Math.max(word1.length, word2.length);
  
  // Allow more tolerance for longer words
  const dynamicThreshold = Math.max(threshold, Math.floor(maxLength * 0.3));
  
  return distance <= dynamicThreshold;
}

// Main fuzzy search function
export function fuzzyMatch(query: string, target: string): boolean {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);
  
  // Exact match
  if (normalizedTarget.includes(normalizedQuery)) return true;
  
  // Split into words
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 0);
  
  // All query words should have a match in target
  return queryWords.every(queryWord => 
    targetWords.some(targetWord => isSimilarWord(queryWord, targetWord))
  );
}

// Calculate match score for sorting (lower is better)
export function fuzzyMatchScore(query: string, target: string): number {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);
  
  // Exact match gets best score
  if (normalizedTarget === normalizedQuery) return 0;
  if (normalizedTarget.includes(normalizedQuery)) return 1;
  if (normalizedTarget.startsWith(normalizedQuery)) return 0.5;
  
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 0);
  
  let totalScore = 0;
  queryWords.forEach(queryWord => {
    let bestDistance = Infinity;
    targetWords.forEach(targetWord => {
      const distance = levenshteinDistance(queryWord, targetWord);
      if (distance < bestDistance) bestDistance = distance;
    });
    totalScore += bestDistance;
  });
  
  return totalScore;
}

// Filter and sort products by fuzzy match
export function fuzzySearchProducts<T extends { name: string; description?: string | null }>(
  products: T[],
  query: string
): T[] {
  if (!query.trim()) return products;
  
  const matched = products.filter(product => {
    const nameMatch = fuzzyMatch(query, product.name);
    const descMatch = product.description ? fuzzyMatch(query, product.description) : false;
    return nameMatch || descMatch;
  });
  
  // Sort by relevance
  return matched.sort((a, b) => {
    const scoreA = Math.min(
      fuzzyMatchScore(query, a.name),
      a.description ? fuzzyMatchScore(query, a.description) : Infinity
    );
    const scoreB = Math.min(
      fuzzyMatchScore(query, b.name),
      b.description ? fuzzyMatchScore(query, b.description) : Infinity
    );
    return scoreA - scoreB;
  });
}
