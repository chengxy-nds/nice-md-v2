// 文档字数 / 图片数的统一口径：侧栏文档列表（SidebarDocItem）和编辑区底部
// 状态栏（EditorPanel）都用这里，两处显示的数字永远一致。改口径只改这里。

/** 字数：去掉 HTML 标签、代码块、Markdown 符号和全部空白后剩下的字符数。 */
export function countDocChars(markdown) {
  const raw = markdown || '';
  if (!raw) return 0;
  const cleaned = raw
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, m => m.replace(/```\w*\n?/g, ''))
    .replace(/[#*`~>\-[\]()!|]/g, '')
    .replace(/\s+/g, '');
  return cleaned.length;
}

/**
 * 图片数：正文里 ![...](...) 和 <img> 出现的次数。
 * 同一张图在文中出现两次算两张，和读者看到的一致。
 */
export function countDocImages(markdown) {
  const raw = markdown || '';
  if (!raw) return 0;
  const md = raw.match(/!\[.*?]\((?:https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/g);
  const html = raw.match(/<img[^>]+src=["'][^"']+["']/gi);
  return (md ? md.length : 0) + (html ? html.length : 0);
}
