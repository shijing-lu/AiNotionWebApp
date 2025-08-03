'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ open, onClose }) => {
  const shortcuts = [
    {
      category: '文件操作',
      items: [
        { key: 'Ctrl+S', desc: '保存笔记' },
      ]
    },
    {
      category: '文本格式',
      items: [
        { key: 'Ctrl+B', desc: '粗体' },
        { key: 'Ctrl+I', desc: '斜体' },
        { key: 'Ctrl+U', desc: '下划线' },
        { key: 'Ctrl+`', desc: '行内代码' },
        { key: 'Ctrl+Shift+`', desc: '代码块' },
        { key: 'Ctrl+0', desc: '清除格式' },
      ]
    },
    {
      category: '标题',
      items: [
        { key: 'Ctrl+1', desc: '一级标题' },
        { key: 'Ctrl+2', desc: '二级标题' },
        { key: 'Ctrl+3', desc: '三级标题' },
        { key: 'Ctrl+4', desc: '四级标题' },
        { key: 'Ctrl+5', desc: '五级标题' },
        { key: 'Ctrl+6', desc: '六级标题' },
      ]
    },
    {
      category: '编辑功能',
      items: [
        { key: 'Ctrl+L', desc: '选择当前行' },
        { key: 'Ctrl+Shift+K', desc: '删除当前行' },
        { key: 'Ctrl+Enter', desc: '插入表格' },
      ]
    },
    {
      category: '视图',
      items: [
        { key: 'Ctrl+/', desc: '切换编辑/预览模式' },
      ]
    }
  ];

  const formatKey = (key: string) => {
    return key.split('+').map((k, index) => (
      <React.Fragment key={k}>
        {index > 0 && <span style={{ margin: '0 4px' }}>+</span>}
        <Chip
          label={k}
          size="small"
          variant="outlined"
          sx={{ 
            fontSize: '0.75rem',
            height: '24px',
            fontFamily: 'monospace',
            bgcolor: 'grey.100'
          }}
        />
      </React.Fragment>
    ));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardIcon />
          <Typography variant="h6">快捷键说明</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          使用以下快捷键提升你的编辑效率，就像在 Typora 中一样！
        </Typography>

        <Stack spacing={3}>
          {shortcuts.map((category) => (
            <Box key={category.category}>
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                {category.category}
              </Typography>
              
              <Stack spacing={1.5}>
                {category.items.map((item) => (
                  <Box 
                    key={item.key}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'grey.50'
                      }
                    }}
                  >
                    <Typography variant="body2">
                      {item.desc}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formatKey(item.key)}
                    </Box>
                  </Box>
                ))}
              </Stack>
              
              {category.category !== shortcuts[shortcuts.length - 1].category && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.50', borderRadius: 2, border: 1, borderColor: 'info.200' }}>
          <Typography variant="body2" color="info.main">
            💡 <strong>提示：</strong>这些快捷键与 Typora 编辑器保持一致，让你在不同编辑器间无缝切换！
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;