'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
} from '@mui/icons-material';
import { Note, FolderNode } from '@/types/note';

interface FolderTreeProps {
  notes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (note: Note) => void;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  notes,
  selectedNoteId,
  onNoteSelect,
  searchTerm = '',
  onSearchChange,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // 构建文件夹树结构
  const folderTree = useMemo(() => {
    const root: FolderNode = {
      name: 'root',
      path: '',
      type: 'folder',
      children: [],
      isExpanded: true,
    };

    // 过滤笔记（基于搜索）
    const filteredNotes = notes.filter(note => {
      if (!searchTerm) return true;
      return (
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    // 按文件夹路径分组
    const folderMap = new Map<string, FolderNode>();
    
    // 为每个笔记创建文件夹结构
    filteredNotes.forEach(note => {
      if (!note.folderPath) {
        // 没有文件夹路径的笔记直接放在根目录
        root.children!.push({
          name: note.title || 'Untitled',
          path: note.id,
          type: 'file',
          noteId: note.id,
        });
        return;
      }

      const pathParts = note.folderPath.split('/').filter(part => part.length > 0);
      let currentPath = '';
      let currentParent = root;

      // 创建文件夹层级
      pathParts.forEach((folderName, index) => {
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        
        let folderNode = folderMap.get(currentPath);
        if (!folderNode) {
          folderNode = {
            name: folderName,
            path: currentPath,
            type: 'folder',
            children: [],
            isExpanded: expandedFolders.has(currentPath),
          };
          folderMap.set(currentPath, folderNode);
          currentParent.children!.push(folderNode);
        }
        currentParent = folderNode;
      });

      // 添加文件节点
      currentParent.children!.push({
        name: note.title || note.fileName || 'Untitled',
        path: `${note.folderPath}/${note.id}`,
        type: 'file',
        noteId: note.id,
      });
    });

    // 递归排序：文件夹在前，文件在后，同类型按名称排序
    const sortChildren = (node: FolderNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortChildren);
      }
    };

    sortChildren(root);
    return root;
  }, [notes, searchTerm, expandedFolders]);

  const handleFolderToggle = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const handleNoteClick = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      onNoteSelect(note);
    }
  };

  const renderNode = (node: FolderNode, depth: number = 0): React.ReactNode => {
    if (node.type === 'folder' && node.name === 'root') {
      // 根节点不显示，直接渲染子节点
      return node.children?.map((child, index) => (
        <React.Fragment key={child.path || index}>
          {renderNode(child, depth)}
        </React.Fragment>
      ));
    }

    const isExpanded = expandedFolders.has(node.path);
    const isSelected = node.noteId === selectedNoteId;
    const note = node.noteId ? notes.find(n => n.id === node.noteId) : null;

    return (
      <React.Fragment key={node.path}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton
            selected={isSelected}
            onClick={() => {
              if (node.type === 'folder') {
                handleFolderToggle(node.path);
              } else if (node.noteId) {
                handleNoteClick(node.noteId);
              }
            }}
            sx={{
              py: 0.5,
              minHeight: 36,
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {node.type === 'folder' ? (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderToggle(node.path);
                    }}
                    sx={{ p: 0, mr: 0.5 }}
                  >
                    {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                  </IconButton>
                  {isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2.5 }}>
                  <FileIcon fontSize="small" />
                  {note?.isBookmarked && (
                    <BookmarkedIcon fontSize="small" color="primary" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: node.type === 'folder' ? 'medium' : 'normal',
                    fontSize: node.type === 'folder' ? '0.875rem' : '0.8rem',
                  }}
                  noWrap
                >
                  {node.name}
                </Typography>
              }
              secondary={
                node.type === 'file' && note ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </Typography>
                    {note.tags.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        {note.tags.slice(0, 3).map(tag => (
                          <Typography
                            key={tag}
                            variant="caption"
                            sx={{
                              backgroundColor: 'primary.main',
                              color: 'white',
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.6rem',
                              mr: 0.5,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSearchChange) {
                                onSearchChange(tag);
                              }
                            }}
                          >
                            {tag}
                          </Typography>
                        ))}
                        {note.tags.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{note.tags.length - 3}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : undefined
              }
            />
          </ListItemButton>
        </ListItem>

        {/* 渲染子文件夹和文件 */}
        {node.type === 'folder' && node.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map((child, index) => renderNode(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (folderTree.children?.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {searchTerm ? 'No notes match your search' : 'No notes yet'}
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ py: 0 }}>
      {renderNode(folderTree)}
    </List>
  );
};

export default FolderTree;