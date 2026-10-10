import React, { useState } from 'react';
import { marked } from 'marked';
import { MermaidViewer } from './MermaidViewer';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Extract and separate Mermaid blocks from markdown
  const parts: { type: 'markdown' | 'mermaid'; content: string }[] = [];
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mermaidRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'markdown',
        content: content.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'mermaid',
      content: match[1].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'markdown',
      content: content.substring(lastIndex),
    });
  }

  return (
    <div className={`prose-crypton ${className}`}>
      {parts.map((part, idx) => {
        if (part.type === 'mermaid') {
          return <MermaidViewer key={idx} chart={part.content} />;
        }

        // Render markdown with marked
        const rawHtml = marked.parse(part.content, {
          gfm: true,
          breaks: true,
        }) as string;

        return (
          <div
            key={idx}
            className="markdown-chunk"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        );
      })}
    </div>
  );
};
