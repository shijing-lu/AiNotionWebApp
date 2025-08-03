'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Note } from '@/types/note';
import NoteEditor from './NoteEditor';
import NoteList from './NoteList';
import AIChatSidebar from './AIChatSidebar';
import { loadDemoData } from '@/utils/demoData';
import { v4 as uuidv4 } from 'uuid';

const DRAWER_WIDTH = 350;

const NotesApp: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState<{used: number, total: number, percentage: number}>({
    used: 0,
    total: 5 * 1024 * 1024, // 5MB default
    percentage: 0
  });

  // Load notes from localStorage on component mount
  useEffect(() => {
    try {
      const loadedNotes = loadDemoData().map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(loadedNotes);
      
      // Select the most recently updated note
      if (loadedNotes.length > 0) {
        const mostRecent = loadedNotes.sort(
          (a: Note, b: Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        setSelectedNote(mostRecent);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, []);

  // Calculate storage usage
  const calculateStorageUsage = useCallback(() => {
    try {
      const data = localStorage.getItem('ai-notion-notes');
      const used = data ? data.length * 2 : 0; // UTF-16 = 2 bytes per char
      const total = 5 * 1024 * 1024; // 5MB (conservative estimate)
      const percentage = Math.round((used / total) * 100);
      
      setStorageInfo({ used, total, percentage });
      
      // Warn if storage is getting full
      if (percentage > 80) {
        console.warn(`存储空间使用率已达 ${percentage}%，建议清理旧笔记或导出数据`);
      }
    } catch (error) {
      console.error('计算存储使用量时出错:', error);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      try {
        localStorage.setItem('ai-notion-notes', JSON.stringify(notes));
        calculateStorageUsage();
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          alert('存储空间已满！请删除一些旧笔记或导出数据后再试。');
          console.error('localStorage存储空间已满:', error);
        } else {
          console.error('保存笔记时出错:', error);
        }
      }
    }
  }, [notes, calculateStorageUsage]);

  const handleSaveNote = useCallback((noteToSave: Note) => {
    setIsLoading(true);
    
    setNotes(prevNotes => {
      const existingIndex = prevNotes.findIndex(note => note.id === noteToSave.id);
      
      if (existingIndex >= 0) {
        // Update existing note
        const updatedNotes = [...prevNotes];
        updatedNotes[existingIndex] = noteToSave;
        return updatedNotes;
      } else {
        // Add new note
        return [...prevNotes, noteToSave];
      }
    });

    setSelectedNote(noteToSave);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => {
      const filteredNotes = prevNotes.filter(note => note.id !== noteId);
      
      // If we deleted the selected note, select another one or null
      if (selectedNote?.id === noteId) {
        if (filteredNotes.length > 0) {
          const mostRecent = filteredNotes.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setSelectedNote(mostRecent);
        } else {
          setSelectedNote(null);
        }
      }
      
      return filteredNotes;
    });
  }, [selectedNote]);

  const handleNewNote = useCallback(() => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isBookmarked: false,
    };
    
    setSelectedNote(newNote);
    
    // Close drawer on mobile after creating new note
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  const handleImportNote = useCallback((importedNote: Note) => {
    setNotes(prevNotes => [...prevNotes, importedNote]);
    setSelectedNote(importedNote);
    
    // Close drawer on mobile after importing note
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  const handleTextSelection = useCallback((text: string) => {
    setSelectedText(text);
  }, []);

  const handleInsertText = useCallback((text: string) => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        content: selectedNote.content + '\n\n' + text,
        updatedAt: new Date()
      };
      handleSaveNote(updatedNote);
    }
  }, [selectedNote, handleSaveNote]);

  const handleUpdateTags = useCallback((tags: string[]) => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        tags: [...new Set([...selectedNote.tags, ...tags])], // Merge and deduplicate tags
        updatedAt: new Date()
      };
      handleSaveNote(updatedNote);
    }
  }, [selectedNote, handleSaveNote]);

  const handleNoteSelect = useCallback((note: Note) => {
    setSelectedNote(note);
    
    // Close drawer on mobile after selecting note
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const noteListComponent = (
    <NoteList
      notes={notes}
      selectedNoteId={selectedNote?.id}
      onNoteSelect={handleNoteSelect}
      onNewNote={handleNewNote}
      onDeleteNote={handleDeleteNote}
      onImportNote={handleImportNote}
      storageInfo={storageInfo}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: `${drawerOpen ? DRAWER_WIDTH : 0}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            AI Notion - Smart Note Taking
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Toolbar />
          {noteListComponent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          {noteListComponent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{ height: 'calc(100vh - 64px)', p: 1 }}>
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              onTextSelection={handleTextSelection}
              isLoading={isLoading}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
              }}
            >
              <div>
                <Typography variant="h4" gutterBottom color="text.secondary">
                  Welcome to AI Notion
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create your first note to get started with your AI-powered note-taking experience.
                </Typography>
              </div>
            </Box>
          )}
        </Container>
      </Box>

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        noteContent={selectedNote?.content || ''}
        selectedText={selectedText}
        onInsertText={handleInsertText}
        onUpdateTags={handleUpdateTags}
      />
    </Box>
  );
};

export default NotesApp;