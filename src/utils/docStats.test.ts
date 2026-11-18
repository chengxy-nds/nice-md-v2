import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countDocWords,
  countDocChars,
  countDocLines,
  countDocImages,
  extractDocImages,
} from './docStats';
import { defaultMarkdown } from './defaultMarkdown';

test('empty markdown returns zero for all stats', () => {
  assert.equal(countDocWords(''), 0);
  assert.equal(countDocChars(''), 0);
  assert.equal(countDocLines(''), 0);
  assert.equal(countDocImages(''), 0);
  assert.deepEqual(extractDocImages(''), []);
});

test('mixed Chinese and English prose segments words properly instead of whitespace-splitting', () => {
  const md = '今天分享一个我最近在用的 AI 绘图工具，解决了一个痛点。';
  const words = countDocWords(md);
  const chars = countDocChars(md);
  assert.ok(words >= 12 && words <= 20, `expected natural word count, got ${words}`);
  assert.equal(chars, md.replace(/\s+/g, '').length);
});

test('image URLs, link URLs, HTML tags, and YAML frontmatter do not inflate char or word counts', () => {
  const md = [
    '---',
    'title: 隐藏元信息标题',
    'author: 测试',
    '---',
    '',
    '## 标题文本',
    '',
    '点击 [官网](https://example.com/very/long/path/with/query?token=abcdef123456) 查看：',
    '',
    '![示例图](https://cdn.example.com/assets/2026/08/1234567890abcdef.png =260xauto)',
  ].join('\n');

  // Visible text is: 标题文本 + 点击 + 官网 + 查看： = 11 chars
  assert.equal(countDocChars(md), 11);
  assert.equal(countDocLines(md), 10);
  assert.equal(countDocImages(md), 1);
});

test('extractDocImages handles sized images, HTML img tags in document order, and skips fenced code', () => {
  const md = [
    '```markdown',
    '![代码里的示例图](https://example.com/in-code.png)',
    '```',
    '',
    '<img src="https://example.com/first-html.png" alt="第一张HTML图" />',
    '![第二张MD图](https://example.com/second.png)',
    '![第三张尺寸图](https://example.com/third.png =260xauto)',
  ].join('\n');

  const imgs = extractDocImages(md);
  assert.deepEqual(imgs, [
    { url: 'https://example.com/first-html.png', alt: '第一张HTML图' },
    { url: 'https://example.com/second.png', alt: '第二张MD图' },
    { url: 'https://example.com/third.png', alt: '第三张尺寸图' },
  ]);
  assert.equal(countDocImages(md), 3);
});

test('defaultMarkdown counts both full-width and =260xauto sized images', () => {
  const imgs = extractDocImages(defaultMarkdown);
  assert.equal(imgs.length, 2);
  assert.equal(countDocImages(defaultMarkdown), 2);
});
