'use client';

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Folder as FolderIcon,
  ViewList as ListViewIcon,
  AccountTree as TreeViewIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Psychology as AITestIcon,
} from '@mui/icons-material';
import { Note } from '@/types/note';
import FolderTree from './FolderTree';
import AITestDialog from './AITestDialog';

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  onDeleteNote?: (noteId: string) => void;
  onImportNote?: (note: Note) => void;
  storageInfo?: {
    used: number;
    total: number;
    percentage: number;
  };
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNewNote,
  onDeleteNote,
  onImportNote,
  storageInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [aiTestDialogOpen, setAiTestDialogOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  // Filter notes based on search term and selected tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === null || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from all notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, noteId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuNoteId(noteId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuNoteId(null);
  };

  const handleDeleteNote = () => {
    if (menuNoteId && onDeleteNote) {
      onDeleteNote(menuNoteId);
    }
    handleMenuClose();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPreviewText = (content: string, maxLength: number = 100) => {
    const text = content.replace(/[#*`_~]/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderImportClick = () => {
    folderInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        try {
          const content = await file.text();
          const fileName = file.name.replace('.md', '');
          
          // 尝试从文件内容中提取标题
          const lines = content.split('\n');
          let title = fileName;
          
          // 查找第一个 # 标题
          for (const line of lines) {
            const match = line.match(/^#\s+(.+)$/);
            if (match) {
              title = match[1].trim();
              break;
            }
          }

          // 简单的标签提取（基于文件名和内容）
          const tags: string[] = [];
          const lowerContent = content.toLowerCase();
          
          // 根据常见关键词自动生成标签
          if (lowerContent.includes('react') || lowerContent.includes('jsx')) tags.push('React');
          if (lowerContent.includes('typescript') || lowerContent.includes('ts')) tags.push('TypeScript');
          if (lowerContent.includes('javascript') || lowerContent.includes('js')) tags.push('JavaScript');
          if (lowerContent.includes('css') || lowerContent.includes('style')) tags.push('CSS');
          if (lowerContent.includes('html')) tags.push('HTML');
          if (lowerContent.includes('node') || lowerContent.includes('npm')) tags.push('Node.js');
          if (lowerContent.includes('api') || lowerContent.includes('rest')) tags.push('API');
          if (lowerContent.includes('database') || lowerContent.includes('sql')) tags.push('Database');
          if (lowerContent.includes('git')) tags.push('Git');
          if (lowerContent.includes('docker')) tags.push('Docker');
          
          // 移除自动添加的导入标签

          const importedNote: Note = {
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            content,
            tags,
            createdAt: new Date(),
            updatedAt: new Date(),
            isBookmarked: false,
          };

          if (onImportNote) {
            onImportNote(importedNote);
          }
        } catch (error) {
          console.error('Error importing file:', error);
          alert(`导入文件 ${file.name} 时发生错误`);
        }
      } else {
        alert(`文件 ${file.name} 不是Markdown格式，请选择 .md 文件`);
      }
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFolderImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let importedCount = 0;
    let skippedCount = 0;
    const importedNotes: Note[] = [];

    // 处理文件夹中的所有文件
    for (const file of Array.from(files)) {
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        try {
          const content = await file.text();
          
          // 从文件路径中提取相对路径信息
          const filePath = file.webkitRelativePath || file.name;
          const pathParts = filePath.split('/');
          const fileName = pathParts[pathParts.length - 1].replace(/\.(md|markdown)$/, '');
          const folderPath = pathParts.slice(0, -1).join('/');
          
          // 尝试从文件内容中提取标题
          const lines = content.split('\n');
          let title = fileName;
          
          // 查找第一个 # 标题
          for (const line of lines) {
            const match = line.match(/^#\s+(.+)$/);
            if (match) {
              title = match[1].trim();
              break;
            }
          }

          // 生成标签
          const tags: string[] = [];
          const lowerContent = content.toLowerCase();
          
          // 根据常见关键词自动生成标签
          if (lowerContent.includes('react') || lowerContent.includes('jsx')) tags.push('React');
          if (lowerContent.includes('typescript') || lowerContent.includes('ts')) tags.push('TypeScript');
          if (lowerContent.includes('javascript') || lowerContent.includes('js')) tags.push('JavaScript');
          if (lowerContent.includes('css') || lowerContent.includes('style')) tags.push('CSS');
          if (lowerContent.includes('html')) tags.push('HTML');
          if (lowerContent.includes('node') || lowerContent.includes('npm')) tags.push('Node.js');
          if (lowerContent.includes('api') || lowerContent.includes('rest')) tags.push('API');
          if (lowerContent.includes('database') || lowerContent.includes('sql')) tags.push('Database');
          if (lowerContent.includes('git')) tags.push('Git');
          if (lowerContent.includes('docker')) tags.push('Docker');
          if (lowerContent.includes('python')) tags.push('Python');
          if (lowerContent.includes('java')) tags.push('Java');
          if (lowerContent.includes('c++') || lowerContent.includes('cpp')) tags.push('C++');
          if (lowerContent.includes('vue')) tags.push('Vue.js');
          if (lowerContent.includes('angular')) tags.push('Angular');
          
          // 添加文件夹标签（如果在子文件夹中）
          if (folderPath) {
            const folderName = pathParts[pathParts.length - 2]; // 直接父文件夹
            if (folderName && folderName !== '.') {
              tags.push(folderName);
            }
          }
          
          // 移除自动添加的文件夹导入标签

          const importedNote: Note = {
            id: `folder-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            content,
            tags,
            createdAt: new Date(),
            updatedAt: new Date(),
            isBookmarked: false,
            folderPath: folderPath || undefined,
            fileName: fileName,
          };

          importedNotes.push(importedNote);
          importedCount++;

        } catch (error) {
          console.error('Error importing file:', error);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    // 批量导入所有笔记
    if (importedNotes.length > 0 && onImportNote) {
      importedNotes.forEach(note => onImportNote(note));
      
      // 显示导入结果
      const message = `文件夹导入完成！\n成功导入: ${importedCount} 个文件\n跳过: ${skippedCount} 个文件`;
      alert(message);
    } else {
      alert('未找到可导入的Markdown文件');
    }

    // 清空文件输入
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  // 导出所有笔记数据
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(notes, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-notion-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      alert(`成功导出 ${notes.length} 篇笔记！`);
    } catch (error) {
      console.error('导出数据时出错:', error);
      alert('导出失败，请重试。');
    }
  };

  return (
    <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Notes</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton 
              onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')} 
              color={viewMode === 'tree' ? 'primary' : 'default'}
              title={viewMode === 'list' ? '切换到文件夹视图' : '切换到列表视图'}
            >
              {viewMode === 'list' ? <TreeViewIcon /> : <ListViewIcon />}
            </IconButton>
            <IconButton 
              onClick={() => setAiTestDialogOpen(true)} 
              color="secondary" 
              title="测试AI功能"
            >
              <AITestIcon />
            </IconButton>
            <IconButton onClick={handleExportData} color="success" title="导出备份数据">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleFolderImportClick} color="info" title="导入文件夹">
              <FolderIcon />
            </IconButton>
            <IconButton onClick={handleImportClick} color="secondary" title="导入Markdown文件">
              <UploadIcon />
            </IconButton>
            <IconButton onClick={onNewNote} color="primary" title="新建笔记">
              <AddIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* 隐藏的文件输入 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".md,.markdown,text/markdown"
          multiple
          style={{ display: 'none' }}
        />
        
        {/* 隐藏的文件夹输入 */}
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderImport}
          {...({ webkitdirectory: '', directory: '' } as any)}
          multiple
          style={{ display: 'none' }}
        />

        {/* 存储空间信息 */}
        {storageInfo && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              存储使用情况
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                flexGrow: 1, 
                height: 6, 
                bgcolor: 'grey.200', 
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  width: `${Math.min(storageInfo.percentage, 100)}%`, 
                  height: '100%', 
                  bgcolor: storageInfo.percentage > 80 ? 'error.main' : storageInfo.percentage > 60 ? 'warning.main' : 'primary.main',
                  transition: 'width 0.3s ease'
                }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                {storageInfo.percentage}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {Math.round(storageInfo.used / 1024)} KB / {Math.round(storageInfo.total / 1024)} KB
            </Typography>
            {storageInfo.percentage > 80 && (
              <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                ⚠️ 存储空间不足，建议导出备份或删除旧笔记
              </Typography>
            )}
          </Box>
        )}

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search notes or click tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  title="清除搜索"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">
              Filter by tag:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label="All"
                size="small"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchTerm('');
                }}
                color={selectedTag === null && !searchTerm ? 'primary' : 'default'}
                variant={selectedTag === null && !searchTerm ? 'filled' : 'outlined'}
              />
              {allTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onClick={() => {
                    if (selectedTag === tag) {
                      setSelectedTag(null);
                      setSearchTerm('');
                    } else {
                      setSelectedTag(tag);
                      setSearchTerm(tag);
                    }
                  }}
                  color={selectedTag === tag || searchTerm === tag ? 'primary' : 'default'}
                  variant={selectedTag === tag || searchTerm === tag ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Notes List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {viewMode === 'tree' ? (
          <FolderTree
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onNoteSelect={onNoteSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        ) : (
          <>
            {filteredNotes.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || selectedTag ? 'No notes match your filter' : 'No notes yet'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredNotes
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((note) => (
                    <React.Fragment key={note.id}>
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuOpen(e, note.id)}
                            size="small"
                          >
                            <MoreIcon />
                          </IconButton>
                        }
                      >
                        <ListItemButton
                          selected={selectedNoteId === note.id}
                          onClick={() => onNoteSelect(note)}
                          sx={{ pr: 6 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {note.isBookmarked ? (
                              <BookmarkedIcon color="primary" />
                            ) : (
                              <BookmarkIcon color="disabled" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" noWrap>
                                {note.title || 'Untitled'}
                                {note.folderPath && (
                                  <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                                    ({note.folderPath})
                                  </Typography>
                                )}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="div"
                                  sx={{ mb: 0.5 }}
                                >
                                  {formatDate(new Date(note.updatedAt))}
                                </Typography>
                                {note.content && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      fontSize: '0.75rem',
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {getPreviewText(note.content)}
                                  </Typography>
                                )}
                                {note.tags.length > 0 && (
                                  <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                                    {note.tags.slice(0, 5).map(tag => (
                                      <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.6rem', height: 16 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSearchTerm(tag);
                                        }}
                                      />
                                    ))}
                                    {note.tags.length > 5 && (
                                      <Typography variant="caption" color="text.secondary">
                                        +{note.tags.length - 5} more
                                      </Typography>
                                    )}
                                  </Stack>
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
              </List>
            )}
          </>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteNote} sx={{ color: 'error.main' }}>
          Delete Note
        </MenuItem>
      </Menu>

      {/* AI测试对话框 */}
      <AITestDialog 
        open={aiTestDialogOpen} 
        onClose={() => setAiTestDialogOpen(false)} 
      />
    </Paper>
  );
};

export default NoteList;