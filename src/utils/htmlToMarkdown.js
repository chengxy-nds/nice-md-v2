/**
 * Simple HTML to Markdown Parser
 * Parses DOM nodes recursively to generate clean Markdown.
 */
export function htmlToMarkdown(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  function traverse(node) {
    let markdown = '';
    
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const children = Array.from(node.childNodes).map(traverse).join('');
    
    switch (node.tagName.toLowerCase()) {
      case 'h1':
        return `\n# ${children.trim()}\n\n`;
      case 'h2':
        return `\n## ${children.trim()}\n\n`;
      case 'h3':
        return `\n### ${children.trim()}\n\n`;
      case 'h4':
        return `\n#### ${children.trim()}\n\n`;
      case 'p':
        return `\n${children.trim()}\n\n`;
      case 'blockquote':
        return `\n> ${children.trim().replace(/\n/g, '\n> ')}\n\n`;
      case 'strong':
      case 'b':
        return `**${children}**`;
      case 'em':
      case 'i':
        return `*${children}*`;
      case 'code':
        // Check if inside pre
        if (node.parentNode && node.parentNode.tagName.toLowerCase() === 'pre') {
          return children;
        }
        return ` \`${children}\` `;
      case 'pre':
        return `\n\`\`\`javascript\n${children.trim()}\n\`\`\`\n\n`;
      case 'ul':
        return `\n${children}\n`;
      case 'ol':
        return `\n${children}\n`;
      case 'li':
        // Check if ordered list
        const parent = node.parentNode;
        if (parent && parent.tagName.toLowerCase() === 'ol') {
          const index = Array.from(parent.children).indexOf(node) + 1;
          return `${index}. ${children.trim()}\n`;
        }
        return `* ${children.trim()}\n`;
      case 'a':
        const href = node.getAttribute('href') || '';
        return `[${children}](${href})`;
      case 'img':
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || 'image';
        return `![${alt}](${src})`;
      case 'br':
        return '\n';
      case 'div':
      case 'section':
      case 'article':
        return `\n${children}\n`;
      default:
        return children;
    }
  }
  
  // Start traversing from the body tag
  let result = traverse(doc.body);
  
  // Clean up excessive newlines
  result = result
    .replace(/\n{3,}/g, '\n\n')
    .trim();
    
  return result;
}
