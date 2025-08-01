'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Tab,
  Tabs,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Add as AddIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Note, EditorProps } from '@/types/note';
import MarkdownPreview from '@/components/MarkdownPreview';
import AIAssistant from './AIAssistant';
import { v4 as uuidv4 } from 'uuid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      style={{ height: '100%', display: value === index ? 'flex' : 'none', flexDirection: 'column' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>{children}</Box>}
    </div>
  );
}

const NoteEditor: React.FC<EditorProps> = ({
  note,
  onSave,
  onDelete,
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
  const [tabValue, setTabValue] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (note) {
      setCurrentNote(note);
      setHasUnsavedChanges(false);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
  };

  const handleTextSelection = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== end) {
      setSelectedText(target.value.substring(start, end));
    } else {
      setSelectedText('');
    }
  };

  const handleInsertAIText = useCallback((text: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = currentNote.content;
      const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
      handleNoteChange('content', newContent);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  }, [currentNote.content, handleNoteChange]);

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

      {/* Tags */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {currentNote.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          <TextField
            size="small"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            sx={{ minWidth: 100 }}
          />
          <IconButton size="small" onClick={handleAddTag} disabled={!newTag.trim()}>
            <AddIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Editor Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<EditIcon />} label="Edit" />
          <Tab icon={<PreviewIcon />} label="Preview" />
        </Tabs>
      </Box>

      {/* Editor Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            multiline
            variant="outlined"
            placeholder="Start writing your note..."
            value={currentNote.content}
            onChange={(e) => handleNoteChange('content', e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={handleTextSelection}
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                height: '100%',
                alignItems: 'flex-start',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              },
              '& .MuiOutlinedInput-input': {
                height: '100% !important',
                overflow: 'auto !important',
                resize: 'none',
              },
              '& fieldset': {
                border: 'none',
              },
            }}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <MarkdownPreview content={currentNote.content} />
          </Box>
        </TabPanel>
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

      {/* AI Assistant */}
      <AIAssistant
        noteContent={currentNote.content}
        selectedText={selectedText}
        onInsertText={handleInsertAIText}
        onUpdateTags={handleUpdateTags}
      />
    </Paper>
  );
};

export default NoteEditor;