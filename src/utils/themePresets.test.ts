import test from 'node:test';
import assert from 'node:assert/strict';
import { themes, groupThemesByCategory } from './themePresets.js';

test('groupThemesByCategory puts all built-in presets into builtIn when no custom themes exist', () => {
  const { builtIn, custom } = groupThemesByCategory([
    { id: 'classic-indigo', name: '山海 · 经典' },
    { id: 'typora-dark', name: 'Typora · 深色夜间' }
  ]);
  assert.deepEqual(builtIn.map(t => t.id), ['classic-indigo', 'typora-dark']);
  assert.deepEqual(custom, []);
});

test('groupThemesByCategory separates user custom themes from built-in themes and deduplicates ids', () => {
  const { builtIn, custom } = groupThemesByCategory([
    { id: 'classic-indigo', name: '山海 · 经典' },
    { id: 'custom-123', name: '我的极简蓝', isCustom: true },
    { id: 'mountain-warm', name: '山海 · 暖沙' },
    { id: 'custom-123', name: 'Duplicate' },
    { id: 'user-saved-without-prefix', name: '未加前缀自定义' }
  ]);
  assert.deepEqual(builtIn.map(t => t.id), ['classic-indigo', 'mountain-warm']);
  assert.deepEqual(custom.map(t => t.id), ['custom-123', 'user-saved-without-prefix']);
});

test('groupThemesByCategory classifies default exported themes as built-in', () => {
  const { builtIn } = groupThemesByCategory(themes);
  assert.ok(builtIn.length >= 8);
  assert.ok(builtIn.some(t => t.id === 'classic-indigo'));
});
