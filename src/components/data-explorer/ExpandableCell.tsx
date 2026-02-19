import { useState } from "react";

interface ExpandableCellProps {
  content: string | number | null | undefined;
  maxLines?: number;
}

export function ExpandableCell({ content, maxLines = 100 }: ExpandableCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (content === null || content === undefined) {
    return <span>{content}</span>;
  }
  
  const contentStr = String(content);
  const lines = contentStr.split('\n');
  const isLargeContent = lines.length > maxLines;
  
  if (!isLargeContent) {
    return <span>{contentStr}</span>;
  }
  
  const displayContent = isExpanded ? contentStr : lines.slice(0, maxLines).join('\n');
  
  return (
    <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <pre className="whitespace-pre-wrap font-mono text-sm">
        {displayContent}
        {!isExpanded && (
          <>
            ...
            <span className="text-blue-600 hover:text-blue-800 ml-2">
              {isExpanded ? 'Show less' : `Show more (${lines.length - maxLines} more lines)`}
            </span>
          </>
        )}
        {isExpanded && (
          <span className="text-blue-600 hover:text-blue-800 ml-2">
            Show less
          </span>
        )}
      </pre>
    </div>
  );
}