import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className="relative bg-gray-800 rounded-md my-4 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-1.5 bg-gray-900 text-gray-400 text-xs font-mono border-b border-gray-700">
                  <span>{match?.[1] || 'code'}</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-gray-100">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
                {children}
              </code>
            );
          },
          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">{children}</a>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;