'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Psychology as AIIcon,
  Translate as TranslateIcon,
  Summarize as SummarizeIcon,
  HelpOutline as ExplainIcon,
  QuestionAnswer as QAIcon,
  Edit as OptimizeIcon,
  Tag as TagIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AIService, AIResponse } from '@/lib/openai';

interface AIAssistantProps {
  noteContent: string;
  selectedText?: string;
  onInsertText?: (text: string) => void;
  onUpdateTags?: (tags: string[]) => void;
}

type AIAction = 'summarize' | 'translate' | 'explain' | 'qa' | 'optimize' | 'tags';

const AIAssistant: React.FC<AIAssistantProps> = ({
  noteContent,
  selectedText = '',
  onInsertText,
  onUpdateTags,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  
  // Form states
  const [question, setQuestion] = useState('');
  const [concept, setConcept] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [optimizeStyle, setOptimizeStyle] = useState<'formal' | 'casual' | 'academic' | 'creative'>('formal');
  const [maxSummaryLength, setMaxSummaryLength] = useState(200);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionSelect = (action: AIAction) => {
    setCurrentAction(action);
    setDialogOpen(true);
    setResult(null);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentAction(null);
    setResult(null);
    setQuestion('');
    setConcept('');
  };

  const executeAIAction = async () => {
    if (!currentAction) return;

    setIsLoading(true);
    setResult(null);

    try {
      let response: AIResponse;
      const textToProcess = selectedText || noteContent;

      switch (currentAction) {
        case 'summarize':
          response = await AIService.summarizeText(textToProcess, {
            maxLength: maxSummaryLength,
            language: 'zh'
          });
          break;

        case 'translate':
          response = await AIService.translateText(textToProcess, {
            targetLanguage,
          });
          break;

        case 'explain':
          response = await AIService.explainConcept(concept, textToProcess, {
            level: 'intermediate',
            language: 'zh'
          });
          break;

        case 'qa':
          response = await AIService.askQuestion(question, textToProcess);
          break;

        case 'optimize':
          response = await AIService.optimizeContent(textToProcess, optimizeStyle);
          break;

        case 'tags':
          const tags = await AIService.generateTags(textToProcess);
          if (onUpdateTags) {
            onUpdateTags(tags);
          }
          response = { content: `生成了 ${tags.length} 个标签: ${tags.join(', ')}` };
          break;

        default:
          response = { content: '', error: '未知操作' };
      }

      setResult(response);
    } catch (error) {
      setResult({
        content: '',
        error: '执行AI操作时发生错误'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertResult = () => {
    if (result?.content && onInsertText) {
      onInsertText(result.content);
      handleDialogClose();
    }
  };

  const getActionTitle = (action: AIAction): string => {
    const titles = {
      summarize: '生成摘要',
      translate: '翻译文本',
      explain: '解释概念',
      qa: '智能问答',
      optimize: '优化内容',
      tags: '生成标签'
    };
    return titles[action];
  };

  const getActionIcon = (action: AIAction) => {
    const icons = {
      summarize: <SummarizeIcon />,
      translate: <TranslateIcon />,
      explain: <ExplainIcon />,
      qa: <QAIcon />,
      optimize: <OptimizeIcon />,
      tags: <TagIcon />
    };
    return icons[action];
  };

  const renderActionForm = () => {
    switch (currentAction) {
      case 'summarize':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="摘要长度（字数）"
              type="number"
              value={maxSummaryLength}
              onChange={(e) => setMaxSummaryLength(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 50, max: 500 }}
            />
          </Box>
        );

      case 'translate':
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>目标语言</InputLabel>
              <Select
                value={targetLanguage}
                onChange={(e: SelectChangeEvent) => setTargetLanguage(e.target.value)}
                label="目标语言"
              >
                <MenuItem value="English">英语</MenuItem>
                <MenuItem value="Japanese">日语</MenuItem>
                <MenuItem value="Korean">韩语</MenuItem>
                <MenuItem value="French">法语</MenuItem>
                <MenuItem value="German">德语</MenuItem>
                <MenuItem value="Spanish">西班牙语</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'explain':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="要解释的概念"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              fullWidth
              placeholder="输入需要解释的概念或术语"
            />
          </Box>
        );

      case 'qa':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="您的问题"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="基于当前文档内容提问..."
            />
          </Box>
        );

      case 'optimize':
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>优化风格</InputLabel>
              <Select
                value={optimizeStyle}
                onChange={(e: SelectChangeEvent<typeof optimizeStyle>) => 
                  setOptimizeStyle(e.target.value as typeof optimizeStyle)
                }
                label="优化风格"
              >
                <MenuItem value="formal">正式风格</MenuItem>
                <MenuItem value="casual">轻松风格</MenuItem>
                <MenuItem value="academic">学术风格</MenuItem>
                <MenuItem value="creative">创意风格</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'tags':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              将基于文档内容自动生成相关标签
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  const canExecute = () => {
    switch (currentAction) {
      case 'explain':
        return concept.trim().length > 0;
      case 'qa':
        return question.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <>
      {/* AI Assistant Button */}
      <IconButton
        onClick={handleMenuOpen}
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'primary.main',
          color: 'white',
          width: 56,
          height: 56,
          boxShadow: 3,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <AIIcon />
      </IconButton>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => handleActionSelect('summarize')}>
          <SummarizeIcon sx={{ mr: 2 }} />
          生成摘要
        </MenuItem>
        <MenuItem onClick={() => handleActionSelect('translate')}>
          <TranslateIcon sx={{ mr: 2 }} />
          翻译文本
        </MenuItem>
        <MenuItem onClick={() => handleActionSelect('explain')}>
          <ExplainIcon sx={{ mr: 2 }} />
          解释概念
        </MenuItem>
        <MenuItem onClick={() => handleActionSelect('qa')}>
          <QAIcon sx={{ mr: 2 }} />
          智能问答
        </MenuItem>
        <MenuItem onClick={() => handleActionSelect('optimize')}>
          <OptimizeIcon sx={{ mr: 2 }} />
          优化内容
        </MenuItem>
        <MenuItem onClick={() => handleActionSelect('tags')}>
          <TagIcon sx={{ mr: 2 }} />
          生成标签
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '400px' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {currentAction && getActionIcon(currentAction)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {currentAction && getActionTitle(currentAction)}
            </Typography>
          </Box>
          <IconButton onClick={handleDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedText && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                选中的文本：
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  {selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText}
                </Typography>
              </Paper>
            </Box>
          )}

          {renderActionForm()}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
                AI正在处理中...
              </Typography>
            </Box>
          )}

          {result && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                AI处理结果：
              </Typography>
              
              {result.error ? (
                <Alert severity="error">{result.error}</Alert>
              ) : (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.content}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose}>
            取消
          </Button>
          {!result && (
            <Button
              onClick={executeAIAction}
              variant="contained"
              disabled={isLoading || !canExecute()}
            >
              {isLoading ? '处理中...' : '执行'}
            </Button>
          )}
          {result && result.content && onInsertText && (
            <Button
              onClick={handleInsertResult}
              variant="contained"
              color="success"
            >
              插入到笔记
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIAssistant;