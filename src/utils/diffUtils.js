/**
 * diffUtils.js - High-performance Line and Intra-line diffing engine
 * Computes Myers / LCS diffs for text comparison with inline character/word highlights.
 */

/**
 * Computes Longest Common Subsequence (LCS) table for two arrays
 */
function computeLCS(arr1, arr2) {
  const m = arr1.length;
  const n = arr2.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

/**
 * Computes line-level diff between oldText and newText
 */
export function computeLineDiff(oldText = '', newText = '') {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const dp = computeLCS(oldLines, newLines);

  let i = oldLines.length;
  let j = newLines.length;

  const rawDiff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawDiff.push({
        type: 'unchanged',
        oldLine: oldLines[i - 1],
        newLine: newLines[j - 1],
        oldLineNum: i,
        newLineNum: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({
        type: 'added',
        oldLine: '',
        newLine: newLines[j - 1],
        oldLineNum: null,
        newLineNum: j
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({
        type: 'deleted',
        oldLine: oldLines[i - 1],
        newLine: '',
        oldLineNum: i,
        newLineNum: null
      });
      i--;
    }
  }

  rawDiff.reverse();

  // Group into pairs for side-by-side view, detect modified lines
  const sideBySide = [];
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  let idx = 0;
  while (idx < rawDiff.length) {
    const item = rawDiff[idx];
    if (item.type === 'unchanged') {
      sideBySide.push({
        type: 'unchanged',
        left: { lineNum: item.oldLineNum, text: item.oldLine },
        right: { lineNum: item.newLineNum, text: item.newLine }
      });
      unchanged++;
      idx++;
    } else if (item.type === 'deleted') {
      // Check if followed by added -> treat as modified block
      const delBlock = [];
      while (idx < rawDiff.length && rawDiff[idx].type === 'deleted') {
        delBlock.push(rawDiff[idx]);
        deletions++;
        idx++;
      }
      const addBlock = [];
      while (idx < rawDiff.length && rawDiff[idx].type === 'added') {
        addBlock.push(rawDiff[idx]);
        additions++;
        idx++;
      }

      const maxLen = Math.max(delBlock.length, addBlock.length);
      for (let k = 0; k < maxLen; k++) {
        const d = delBlock[k];
        const a = addBlock[k];
        if (d && a) {
          const { oldInline, newInline } = computeWordDiff(d.oldLine, a.newLine);
          sideBySide.push({
            type: 'modified',
            left: { lineNum: d.oldLineNum, text: d.oldLine, inlineDiff: oldInline },
            right: { lineNum: a.newLineNum, text: a.newLine, inlineDiff: newInline }
          });
        } else if (d) {
          sideBySide.push({
            type: 'deleted',
            left: { lineNum: d.oldLineNum, text: d.oldLine },
            right: { lineNum: null, text: '' }
          });
        } else if (a) {
          sideBySide.push({
            type: 'added',
            left: { lineNum: null, text: '' },
            right: { lineNum: a.newLineNum, text: a.newLine }
          });
        }
      }
    } else if (item.type === 'added') {
      sideBySide.push({
        type: 'added',
        left: { lineNum: null, text: '' },
        right: { lineNum: item.newLineNum, text: item.newLine }
      });
      additions++;
      idx++;
    }
  }

  return {
    raw: rawDiff,
    sideBySide,
    stats: {
      additions,
      deletions,
      unchanged,
      totalChanges: additions + deletions
    }
  };
}

/**
 * Computes intra-line character/word diff for modified lines
 */
export function computeWordDiff(oldStr = '', newStr = '') {
  if (oldStr === newStr) {
    return {
      oldInline: [{ type: 'same', text: oldStr }],
      newInline: [{ type: 'same', text: newStr }]
    };
  }

  // Tokenize by characters or words
  const tokenize = (s) => s.match(/[\w\u4e00-\u9fa5]+|[^\w\u4e00-\u9fa5\s]+|\s+/g) || [s];
  const oldTokens = tokenize(oldStr);
  const newTokens = tokenize(newStr);

  const dp = computeLCS(oldTokens, newTokens);

  let i = oldTokens.length;
  let j = newTokens.length;

  const oldRes = [];
  const newRes = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      oldRes.push({ type: 'same', text: oldTokens[i - 1] });
      newRes.push({ type: 'same', text: newTokens[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      newRes.push({ type: 'add', text: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      oldRes.push({ type: 'del', text: oldTokens[i - 1] });
      i--;
    }
  }

  return {
    oldInline: oldRes.reverse(),
    newInline: newRes.reverse()
  };
}
