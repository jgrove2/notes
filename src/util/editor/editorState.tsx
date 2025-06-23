import { marked, Marked } from 'marked';
import {create} from 'zustand';
import { formatMarkdownToHtml } from '../markdown/markdown';

interface EditorState {
    lineNumber: number;
    cursorPosition: number;
    htmlText: string;
    markdownText: string;
    setMarkdownText: (text: string) => void;
    setHtmlText: (text: string) => void;
    setLineNumber: (line: number) => void;
    setCursorPosition: (position: number) => void;
    setEditorState: (line: number, position: number) => void;
    formatMarkdownToHtml: (markdown: string) => Promise<string>;
}

export const useEditorState = create<EditorState>((set) => ({
    lineNumber: 1,
    cursorPosition: 0,
    markdownText: '',
    htmlText: '',
    setMarkdownText: (text: string) => set({ markdownText: text }),
    setHtmlText: (text: string) => set({ htmlText: text }),
    setLineNumber: (line: number) => set({ lineNumber: line }),
    setCursorPosition: (position: number) => set({ cursorPosition: position }),
    setEditorState: (line: number, position: number) => set({ lineNumber: line, cursorPosition: position }),
    formatMarkdownToHtml: async (markdown: string) => {
        return await formatMarkdownToHtml(markdown);
    }
}));