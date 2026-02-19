"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

import { Button } from "./button";

type CodeViewerProps = {
  data: string;      
  label?: string;
  language?: string;
};

function prettyMaybeJson(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

export default function CodeViewer({ data, label, language }: CodeViewerProps) {
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const codeRef = useRef<HTMLElement | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setContent(prettyMaybeJson(data));
  }, [data]);

  useEffect(() => {
    if (!codeRef.current || !content) return;

    codeRef.current.removeAttribute("data-highlighted");
    hljs.highlightElement(codeRef.current);
  }, [content, language]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current)
        window.clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const copyToClipboard = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      if (codeRef.current) {
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      if (copiedTimeoutRef.current)
        window.clearTimeout(copiedTimeoutRef.current);

      copiedTimeoutRef.current = window.setTimeout(
        () => setCopied(false),
        1500
      );
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        {label && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-white">
            {label}
          </span>
        )}
        <Button
          type="button"
          size="sm"
          onClick={copyToClipboard}
          className="text-[11px] cursor-pointer !py-1 h-fit"
          disabled={!content}
          variant="outline"
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre className="p-3 text-sm font-mono whitespace-pre overflow-auto max-h-[70vh] border bg-white">
        <code ref={codeRef} className={`language-${language} block`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
