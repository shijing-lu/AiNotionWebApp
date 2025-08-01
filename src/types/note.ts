export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  isBookmarked: boolean;
  folderPath?: string; // 文件夹路径，如 "frontend/components"
  fileName?: string;   // 原始文件名
}

export interface FolderNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FolderNode[];
  noteId?: string; // 如果是文件，关联的笔记ID
  isExpanded?: boolean;
}

export interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
}

export interface EditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  isLoading?: boolean;
}

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
}