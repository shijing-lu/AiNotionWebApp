'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Toolbar,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Add as AddIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';
import { Note, EditorProps } from '@/types/note';
import MarkdownPreview from '@/components/MarkdownPreview';
import KeyboardShortcuts from './KeyboardShortcuts';
import { v4 as uuidv4 } from 'uuid';



interface NoteEditorProps extends EditorProps {
  onTextSelection?: (text: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onTextSelection,
  isLoading = false,
}) => {
  const [currentNote, setCurrentNote] = useState<Note>(() => {
    return note || {
      id: uuidv4(),
      title: '',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isBookmarked: false,
    };
  });

  const [newTag, setNewTag] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      setCurrentNote(note);
      setHasUnsavedChanges(false);
      
      // 更新编辑器内容
      if (editorRef.current) {
        editorRef.current.textContent = note.content;
      }
    }
  }, [note]);

  const handleNoteChange = useCallback((field: keyof Note, value: any) => {
    setCurrentNote(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(currentNote);
    setHasUnsavedChanges(false);
  }, [currentNote, onSave]);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !currentNote.tags.includes(newTag.trim())) {
      handleNoteChange('tags', [...currentNote.tags, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, currentNote.tags, handleNoteChange]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    handleNoteChange('tags', currentNote.tags.filter(tag => tag !== tagToRemove));
  }, [currentNote.tags, handleNoteChange]);

  const handleDelete = useCallback(() => {
    if (onDelete && currentNote.id) {
      onDelete(currentNote.id);
      setDeleteDialogOpen(false);
    }
  }, [onDelete, currentNote.id]);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Typora-style shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          handleSave();
          break;
        case 'b':
          event.preventDefault();
          insertMarkdownSyntax('**', '**', '粗体文本');
          break;
        case 'i':
          event.preventDefault();
          insertMarkdownSyntax('*', '*', '斜体文本');
          break;
        case 'u':
          event.preventDefault();
          insertMarkdownSyntax('<u>', '</u>', '下划线文本');
          break;
        case '`':
          event.preventDefault();
          if (event.shiftKey) {
            insertMarkdownSyntax('\n```\n', '\n```\n', '代码块');
          } else {
            insertMarkdownSyntax('`', '`', '代码');
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          if (!event.shiftKey) {
            event.preventDefault();
            insertMarkdownSyntax(`${'#'.repeat(parseInt(event.key))} `, '', '标题');
          }
          break;
        case '0':
          event.preventDefault();
          insertMarkdownSyntax('', '', '', true); // 清除格式
          break;
        case 'l':
          event.preventDefault();
          selectCurrentLine();
          break;
        case 'k':
          if (event.shiftKey) {
            event.preventDefault();
            deleteCurrentLine();
          }
          break;
        case 'Enter':
          event.preventDefault();
          insertTable();
          break;
        case '/':
          event.preventDefault();
          // 可以用于其他功能，比如快速命令
          break;
      }
    }
  };

  const insertMarkdownSyntax = (before: string, after: string = '', placeholder: string = '', clearFormat: boolean = false) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = currentNote.content;

    let newText: string;
    let newCursorPos: number;

    if (clearFormat) {
      // 清除当前行的 Markdown 格式
      const lineStart = currentContent.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = currentContent.indexOf('\n', end);
      const actualLineEnd = lineEnd === -1 ? currentContent.length : lineEnd;
      const currentLine = currentContent.substring(lineStart, actualLineEnd);
      const cleanLine = currentLine.replace(/^#+\s*|^\*+\s*|^>+\s*|^\d+\.\s*|^-\s*/, '');
      
      newText = currentContent.substring(0, lineStart) + cleanLine + currentContent.substring(actualLineEnd);
      newCursorPos = lineStart + cleanLine.length;
    } else {
      if (selectedText) {
        newText = currentContent.substring(0, start) + before + selectedText + after + currentContent.substring(end);
        newCursorPos = start + before.length + selectedText.length + after.length;
      } else {
        newText = currentContent.substring(0, start) + before + placeholder + after + currentContent.substring(end);
        newCursorPos = start + before.length + placeholder.length;
      }
    }

    handleNoteChange('content', newText);

    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const selectCurrentLine = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const content = textarea.value;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;

    textarea.focus();
    textarea.setSelectionRange(lineStart, actualLineEnd);
  };

  const deleteCurrentLine = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const content = textarea.value;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? content.length : lineEnd + 1;

    const newContent = content.substring(0, lineStart) + content.substring(actualLineEnd);
    handleNoteChange('content', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart);
    }, 0);
  };

  const insertTable = () => {
    const tableTemplate = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
|     |     |     |
|     |     |     |
`;
    insertMarkdownSyntax(tableTemplate, '', '');
  };

  const handleSmartInput = (e: React.FormEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    // 更新内容状态
    const textContent = editor.textContent || '';
    handleNoteChange('content', textContent);

    // 获取当前行
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;
    
    // 找到当前行的文本
    let lineText = '';
    let lineElement: Element | null = null;
    
    if (currentNode.nodeType === Node.TEXT_NODE) {
      lineText = currentNode.textContent || '';
      lineElement = currentNode.parentElement;
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      lineElement = currentNode as Element;
      lineText = lineElement.textContent || '';
    }

    if (!lineElement) return;

    // 检测 Markdown 语法并转换
    setTimeout(() => {
      processMarkdownSyntax(lineElement, lineText, selection, range);
    }, 0);
  };

  const processMarkdownSyntax = (element: Element, text: string, selection: Selection, range: Range) => {
    const cursorPos = range.startOffset;
    
    // 标题检测
    const headerMatch = text.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch && element.tagName !== `H${headerMatch[1].length}`) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      
      const newElement = document.createElement(`h${level}`);
      newElement.textContent = content;
      element.replaceWith(newElement);
      
      // 恢复光标位置
      if (content) {
        range.setStart(newElement.firstChild!, Math.min(cursorPos - level - 1, content.length));
        range.setEnd(newElement.firstChild!, Math.min(cursorPos - level - 1, content.length));
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return;
    }

    // 粗体检测
    const boldMatch = text.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
      const beforeText = text.substring(0, text.indexOf(boldMatch[0]));
      const afterText = text.substring(text.indexOf(boldMatch[0]) + boldMatch[0].length);
      
      element.innerHTML = '';
      if (beforeText) element.appendChild(document.createTextNode(beforeText));
      
      const strongElement = document.createElement('strong');
      strongElement.textContent = boldMatch[1];
      element.appendChild(strongElement);
      
      if (afterText) element.appendChild(document.createTextNode(afterText));
      
      // 设置光标到粗体文字后
      range.setStartAfter(strongElement);
      range.setEndAfter(strongElement);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    // 斜体检测
    const italicMatch = text.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    if (italicMatch) {
      const beforeText = text.substring(0, text.indexOf(italicMatch[0]));
      const afterText = text.substring(text.indexOf(italicMatch[0]) + italicMatch[0].length);
      
      element.innerHTML = '';
      if (beforeText) element.appendChild(document.createTextNode(beforeText));
      
      const emElement = document.createElement('em');
      emElement.textContent = italicMatch[1];
      element.appendChild(emElement);
      
      if (afterText) element.appendChild(document.createTextNode(afterText));
      
      // 设置光标到斜体文字后
      range.setStartAfter(emElement);
      range.setEndAfter(emElement);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    // 行内代码检测
    const codeMatch = text.match(/`([^`]+)`/);
    if (codeMatch) {
      const beforeText = text.substring(0, text.indexOf(codeMatch[0]));
      const afterText = text.substring(text.indexOf(codeMatch[0]) + codeMatch[0].length);
      
      element.innerHTML = '';
      if (beforeText) element.appendChild(document.createTextNode(beforeText));
      
      const codeElement = document.createElement('code');
      codeElement.textContent = codeMatch[1];
      element.appendChild(codeElement);
      
      if (afterText) element.appendChild(document.createTextNode(afterText));
      
      // 设置光标到代码后
      range.setStartAfter(codeElement);
      range.setEndAfter(codeElement);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    }
  };



  const handleTextSelection = (event: React.SyntheticEvent) => {
    const selection = window.getSelection();
    const selectedValue = selection ? selection.toString() : '';
    
    setSelectedText(selectedValue);
    
    // Notify parent component about text selection
    if (onTextSelection) {
      onTextSelection(selectedValue);
    }
  };

  const handleInsertAIText = useCallback((text: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // 插入换行和文本
      const br = document.createElement('br');
      const textNode = document.createTextNode(text);
      
      range.insertNode(br);
      range.insertNode(textNode);
      
      // 设置光标到插入文本后
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 更新内容
      handleNoteChange('content', editor.textContent || '');
    } else {
      // 在末尾添加
      const br = document.createElement('br');
      const textNode = document.createTextNode(text);
      editor.appendChild(br);
      editor.appendChild(textNode);
      handleNoteChange('content', editor.textContent || '');
    }
  }, [handleNoteChange]);

  const handleUpdateTags = useCallback((newTags: string[]) => {
    const uniqueTags = Array.from(new Set([...currentNote.tags, ...newTags]));
    handleNoteChange('tags', uniqueTags);
  }, [currentNote.tags, handleNoteChange]);

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {currentNote.title || 'Untitled Note'}
          {hasUnsavedChanges && <Typography component="span" color="warning.main"> *</Typography>}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => setShortcutsDialogOpen(true)}
            color="default"
            title="快捷键说明"
          >
            <KeyboardIcon />
          </IconButton>
          
          <IconButton
            onClick={() => handleNoteChange('isBookmarked', !currentNote.isBookmarked)}
            color={currentNote.isBookmarked ? 'primary' : 'default'}
          >
            {currentNote.isBookmarked ? <BookmarkedIcon /> : <BookmarkIcon />}
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading || !hasUnsavedChanges}
            size="small"
          >
            Save
          </Button>
          
          {onDelete && (
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              color="error"
              disabled={isLoading}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Stack>
      </Toolbar>

      {/* Note Title */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Note title..."
          value={currentNote.title}
          onChange={(e) => handleNoteChange('title', e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.5rem',
              fontWeight: 'bold',
            },
          }}
        />
      </Box>



      <Divider />

      {/* Smart Editor Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleSmartInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleTextSelection}
          onPaste={handlePaste}
          sx={{
            height: '100%',
            padding: '16px',
            overflow: 'auto',
            outline: 'none',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'text.primary',
            '&:focus': {
              outline: 'none'
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontWeight: 'bold',
              margin: '16px 0 8px 0',
              color: '#333',
            },
            '& h1': { fontSize: '2rem' },
            '& h2': { fontSize: '1.5rem' },
            '& h3': { fontSize: '1.25rem' },
            '& h4': { fontSize: '1.1rem' },
            '& h5': { fontSize: '1rem' },
            '& h6': { fontSize: '0.9rem' },
            '& strong': { fontWeight: 'bold' },
            '& em': { fontStyle: 'italic' },
            '& code': {
              backgroundColor: '#f5f5f5',
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.9em',
            },
            '& pre': {
              backgroundColor: '#f8f8f8',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              margin: '12px 0',
              '& code': {
                backgroundColor: 'transparent',
                padding: 0,
              }
            },
            '& blockquote': {
              borderLeft: '4px solid #ddd',
              margin: '12px 0',
              padding: '8px 16px',
              backgroundColor: '#f9f9f9',
              color: '#666',
            },
            '& ul, & ol': {
              margin: '8px 0',
              paddingLeft: '24px',
            },
            '& li': {
              margin: '4px 0',
            },
            '& hr': {
              border: 'none',
              borderTop: '1px solid #ddd',
              margin: '20px 0',
            },
            '& a': {
              color: '#0066cc',
              textDecoration: 'underline',
            },
          }}
        />
        
        {/* 占位符 */}
        {!currentNote.content && (
          <Box sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'text.secondary',
            pointerEvents: 'none',
            fontSize: '1rem'
          }}>
            开始写作...
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentNote.title || 'Untitled Note'}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts 
        open={shortcutsDialogOpen} 
        onClose={() => setShortcutsDialogOpen(false)} 
      />

    </Paper>
  );
};

export default NoteEditor;