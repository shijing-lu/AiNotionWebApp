'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  Person as UserIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Clear as ClearIcon,
  HelpOutline as HelpIcon,
  AutoAwesome as AutoIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { AIService, AIResponse } from '@/lib/openai';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  command?: string;
  parameters?: Record<string, any>;
}

interface AIChatSidebarProps {
  noteContent: string;
  selectedText?: string;
  onInsertText?: (text: string) => void;
  onUpdateTags?: (tags: string[]) => void;
}

interface Command {
  name: string;
  description: string;
  usage: string;
  parameters?: string[];
}

const COMMANDS: Command[] = [
  {
    name: '/summarize',
    description: '生成文档摘要',
    usage: '/summarize [长度]',
    parameters: ['长度 (可选，默认200字)']
  },
  {
    name: '/translate',
    description: '翻译文本',
    usage: '/translate [目标语言]',
    parameters: ['目标语言 (可选，默认英语)']
  },
  {
    name: '/explain',
    description: '解释概念',
    usage: '/explain <概念>',
    parameters: ['概念 (必需)']
  },
  {
    name: '/qa',
    description: '智能问答',
    usage: '/qa <问题>',
    parameters: ['问题 (必需)']
  },
  {
    name: '/optimize',
    description: '优化内容',
    usage: '/optimize [风格]',
    parameters: ['风格 (可选: formal, casual, academic, creative)']
  },
  {
    name: '/tags',
    description: '生成标签',
    usage: '/tags',
    parameters: []
  },
  {
    name: '/help',
    description: '显示帮助信息',
    usage: '/help',
    parameters: []
  },
  {
    name: '/clear',
    description: '清空聊天记录',
    usage: '/clear',
    parameters: []
  }
];

const AI_CHAT_SIDEBAR_WIDTH = 400;
const AI_CHAT_SIDEBAR_WIDTH_MOBILE = 320;

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  noteContent,
  selectedText = '',
  onInsertText,
  onUpdateTags,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarWidth = isMobile ? AI_CHAT_SIDEBAR_WIDTH_MOBILE : AI_CHAT_SIDEBAR_WIDTH;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'system',
      content: '👋 欢迎使用 AI 助手！\n\n您可以使用以下指令与我互动：\n• /help - 查看所有可用指令\n• /summarize - 生成文档摘要\n• /translate - 翻译文本\n• /explain <概念> - 解释概念\n• /qa <问题> - 智能问答\n\n或者直接和我对话！',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AI 正在思考...');
  const [selectedFunction, setSelectedFunction] = useState<string>('chat');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const parseCommand = (input: string): { command: string; args: string[] } | null => {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) return null;
    
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    
    return { command, args };
  };

  const executeCommand = async (command: string, args: string[], originalInput: string) => {
    const textToProcess = selectedText || noteContent;
    
    try {
      let response: AIResponse;
      let resultMessage = '';

      switch (command) {
        case '/help':
          resultMessage = '📚 **可用指令列表：**\n\n' + 
            COMMANDS.map(cmd => 
              `**${cmd.name}** - ${cmd.description}\n   用法: \`${cmd.usage}\`${cmd.parameters?.length ? '\n   参数: ' + cmd.parameters.join(', ') : ''}`
            ).join('\n\n');
          break;

        case '/clear':
          setMessages([{
            id: 'welcome-new',
            type: 'system',
            content: '🧹 聊天记录已清空',
            timestamp: new Date()
          }]);
          return;

        case '/summarize':
          const maxLength = args[0] ? parseInt(args[0]) : 200;
          if (isNaN(maxLength)) {
            resultMessage = '❌ 错误：长度参数必须是数字';
            break;
          }
          response = await AIService.summarizeText(textToProcess, {
            maxLength,
            language: 'zh'
          });
          resultMessage = response.error || response.content;
          break;

        case '/translate':
          const targetLanguage = args[0] || 'English';
          response = await AIService.translateText(textToProcess, { targetLanguage });
          resultMessage = response.error || response.content;
          break;

        case '/explain':
          if (args.length === 0) {
            resultMessage = '❌ 错误：请提供要解释的概念\n用法: `/explain <概念>`';
            break;
          }
          const concept = args.join(' ');
          response = await AIService.explainConcept(concept, textToProcess, {
            level: 'intermediate',
            language: 'zh'
          });
          resultMessage = response.error || response.content;
          break;

        case '/qa':
          if (args.length === 0) {
            resultMessage = '❌ 错误：请提供问题\n用法: `/qa <问题>`';
            break;
          }
          const question = args.join(' ');
          response = await AIService.askQuestion(question, textToProcess);
          resultMessage = response.error || response.content;
          break;

        case '/optimize':
          const style = (args[0] as 'formal' | 'casual' | 'academic' | 'creative') || 'formal';
          if (!['formal', 'casual', 'academic', 'creative'].includes(style)) {
            resultMessage = '❌ 错误：无效的优化风格\n可用风格: formal, casual, academic, creative';
            break;
          }
          response = await AIService.optimizeContent(textToProcess, style);
          resultMessage = response.error || response.content;
          break;

        case '/tags':
          const tags = await AIService.generateTags(textToProcess);
          if (onUpdateTags) {
            onUpdateTags(tags);
          }
          resultMessage = `🏷️ 生成了 ${tags.length} 个标签:\n${tags.map(tag => `• ${tag}`).join('\n')}`;
          break;

        default:
          resultMessage = `❌ 未知指令: ${command}\n\n输入 \`/help\` 查看所有可用指令`;
      }

      addMessage({
        type: 'ai',
        content: resultMessage,
        command,
        parameters: { args }
      });

    } catch (error) {
      addMessage({
        type: 'ai',
        content: `❌ 执行指令时发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
        command,
        parameters: { args, error: true }
      });
    }
  };

  const getPlaceholderText = () => {
    const placeholders = {
      chat: '输入消息或使用指令 (如 /help)...',
      summarize: '输入摘要长度，如：150 (默认200字)...',
      translate: '输入目标语言，如：English (默认英语)...',
      explain: '输入要解释的概念或术语...',
      qa: '基于文档内容提问...',
      optimize: '输入优化风格：formal, casual, academic, creative...',
      tags: '点击发送生成标签 (无需输入内容)...',
      continue: '可以输入续写方向提示 (可选)...',
      rewrite: '可以输入重写要求 (可选)...'
    };
    return placeholders[selectedFunction as keyof typeof placeholders] || placeholders.chat;
  };

  const getFunctionDescription = () => {
    const descriptions = {
      chat: '提示：使用 / 开始指令，或直接对话',
      summarize: '将根据当前文档或选中文本生成摘要',
      translate: '将当前文档或选中文本翻译为指定语言',
      explain: '基于文档内容解释指定的概念或术语',
      qa: '基于当前文档内容回答您的问题',
      optimize: '优化当前文档或选中文本的表达方式',
      tags: '基于文档内容自动生成相关标签',
      continue: '基于当前内容智能续写，保持风格一致',
      rewrite: '重写当前内容，使其更加清晰和专业'
    };
    return descriptions[selectedFunction as keyof typeof descriptions] || descriptions.chat;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const userInput = input.trim();
    
    // Handle different function types
    let commandToExecute = '';
    let finalInput = userInput;

    if (selectedFunction !== 'chat') {
      // Convert function selection to command
      switch (selectedFunction) {
        case 'summarize':
          commandToExecute = userInput ? `/summarize ${userInput}` : '/summarize';
          break;
        case 'translate':
          commandToExecute = userInput ? `/translate ${userInput}` : '/translate';
          break;
        case 'explain':
          if (!userInput) {
            addMessage({
              type: 'system',
              content: '❌ 请输入要解释的概念或术语'
            });
            return;
          }
          commandToExecute = `/explain ${userInput}`;
          break;
        case 'qa':
          if (!userInput) {
            addMessage({
              type: 'system',
              content: '❌ 请输入您的问题'
            });
            return;
          }
          commandToExecute = `/qa ${userInput}`;
          break;
        case 'optimize':
          commandToExecute = userInput ? `/optimize ${userInput}` : '/optimize';
          break;
        case 'tags':
          commandToExecute = '/tags';
          break;
      }
      finalInput = commandToExecute;
    }

    if (!finalInput.trim() && selectedFunction === 'chat') return;

    setInput('');

    // Add user message
    addMessage({
      type: 'user',
      content: selectedFunction === 'chat' ? userInput : `${getFunctionTitle(selectedFunction)}${userInput ? `: ${userInput}` : ''}`
    });

    setIsLoading(true);

    try {
      // Parse command
      const parsedCommand = parseCommand(finalInput);
      
      if (parsedCommand) {
        // Execute command
        await executeCommand(parsedCommand.command, parsedCommand.args, finalInput);
      } else {
        // Handle as general chat
        const response = await AIService.askQuestion(finalInput, noteContent);
        addMessage({
          type: 'ai',
          content: response.error || response.content
        });
      }
    } catch (error) {
      addMessage({
        type: 'ai',
        content: `❌ 处理消息时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFunctionTitle = (func: string) => {
    const titles = {
      summarize: '📝 生成摘要',
      translate: '🌐 翻译文本',
      explain: '🎓 解释概念',
      qa: '❓ 智能问答',
      optimize: '✨ 优化内容',
      tags: '🏷️ 生成标签',
      continue: '✍️ 续写内容',
      rewrite: '🔄 重写优化'
    };
    return titles[func as keyof typeof titles] || '';
  };

  const handleQuickGenerate = async () => {
    if (selectedFunction === 'chat' || isLoading) return;

    setIsLoading(true);
    setShowPreview(false);
    setLoadingMessage(`正在${getFunctionTitle(selectedFunction)}...`);

    // Add system message showing what we're generating
    addMessage({
      type: 'system',
      content: `🤖 正在${getFunctionTitle(selectedFunction)}...`
    });

    // Add timeout for long requests
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadingMessage('请求处理中，请稍候...');
      }
    }, 5000);

    try {
      let response: AIResponse;
      const textToProcess = selectedText || noteContent;

      switch (selectedFunction) {
        case 'summarize':
          response = await AIService.summarizeText(textToProcess, {
            maxLength: 200,
            language: 'zh'
          });
          break;

        case 'translate':
          response = await AIService.translateText(textToProcess, {
            targetLanguage: 'English'
          });
          break;

        case 'optimize':
          response = await AIService.optimizeContent(textToProcess, 'formal');
          break;

        case 'continue':
          response = await AIService.askQuestion(
            "请基于当前内容继续写作，保持风格一致，内容连贯自然。请直接提供续写内容，不要有多余说明。",
            textToProcess
          );
          break;

        case 'rewrite':
          response = await AIService.askQuestion(
            "请重写以下内容，使其更加清晰、流畅和专业。保持原意不变，但改善表达方式。请直接提供重写后的内容。",
            textToProcess
          );
          break;

        case 'tags':
          const tags = await AIService.generateTags(textToProcess);
          if (onUpdateTags) {
            onUpdateTags(tags);
          }
          response = { content: `生成了 ${tags.length} 个标签: ${tags.join(', ')}` };
          break;

        default:
          response = { content: '', error: '未支持的功能' };
      }

      if (response.error) {
        addMessage({
          type: 'ai',
          content: `❌ ${response.error}`
        });
      } else {
        setGeneratedContent(response.content);
        setShowPreview(true);
      }

    } catch (error) {
      addMessage({
        type: 'ai',
        content: `❌ 生成内容时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptGenerated = () => {
    if (!generatedContent) return;

    // Insert generated content to the note
    if (onInsertText) {
      onInsertText(generatedContent);
    }

    // Add success message to chat
    addMessage({
      type: 'system',
      content: '✅ 内容已插入到笔记中'
    });

    // Clear preview
    setGeneratedContent('');
    setShowPreview(false);
  };

  const handleRejectGenerated = () => {
    addMessage({
      type: 'system',
      content: '❌ 已拒绝生成的内容'
    });

    setGeneratedContent('');
    setShowPreview(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  const handleInsertToNote = (content: string) => {
    if (onInsertText) {
      onInsertText(content);
      // Show success message
      addMessage({
        type: 'system',
        content: '✅ 内容已插入到笔记中'
      });
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <ListItem
        key={message.id}
        sx={{
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          py: 1,
          px: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            maxWidth: isMobile ? '85%' : '90%',
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: isUser 
                ? theme.palette.primary.main 
                : isSystem 
                ? theme.palette.grey[400]
                : theme.palette.secondary.main,
            }}
          >
            {isUser ? (
              <UserIcon sx={{ fontSize: 18 }} />
            ) : (
              <AIIcon sx={{ fontSize: 18 }} />
            )}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={1}
              sx={{
                p: isMobile ? 1 : 1.5,
                bgcolor: isUser 
                  ? theme.palette.primary.main 
                  : isSystem
                  ? alpha(theme.palette.grey[200], 0.8)
                  : alpha(theme.palette.secondary.main, 0.1),
                color: isUser ? 'white' : 'text.primary',
                borderRadius: 2,
                '& pre': {
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: isMobile ? '0.8125rem' : '0.875rem',
                },
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: isMobile ? '0.8125rem' : '0.875rem',
                  lineHeight: 1.4,
                }}
              >
                {message.content}
              </Typography>
              
              {message.command && (
                <Chip
                  label={message.command}
                  size="small"
                  sx={{ 
                    mt: 1, 
                    height: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha('white', 0.2)
                  }}
                />
              )}
              
              {!isUser && !isSystem && message.content && (
                <Tooltip title="插入到笔记">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertToNote(message.content)}
                    sx={{ 
                      mt: 0.5,
                      ml: 0.5,
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      }
                    }}
                  >
                    <SendIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
            
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                mt: 0.5,
                display: 'block',
                textAlign: isUser ? 'right' : 'left'
              }}
            >
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Box>
        </Box>
      </ListItem>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: 'fixed',
          top: isMobile ? 'auto' : '50%',
          bottom: isMobile ? 80 : 'auto',
          right: isOpen ? sidebarWidth - 10 : 10,
          transform: isMobile ? 'none' : 'translateY(-50%)',
          zIndex: theme.zIndex.drawer + 2,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          width: isMobile ? 50 : 40,
          height: 60,
          borderRadius: isOpen ? '12px 0 0 12px' : '12px',
          boxShadow: theme.shadows[4],
          transition: theme.transitions.create(['right'], {
            duration: theme.transitions.duration.enteringScreen,
          }),
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          },
        }}
      >
        {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      {/* Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          top: isMobile ? 0 : 64,
          right: isOpen ? 0 : -sidebarWidth,
          width: sidebarWidth,
          height: isMobile ? '100vh' : 'calc(100vh - 64px)',
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[8],
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['right'], {
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.primary.main,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon />
              <Typography variant="h6">AI 助手</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="帮助">
                <IconButton
                  size="small"
                  onClick={() => {
                    setInput('/help');
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  sx={{ color: 'white' }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="清空聊天">
                <IconButton
                  size="small"
                  onClick={() => {
                    setInput('/clear');
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  sx={{ color: 'white' }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {selectedText && (
            <Chip
              label={`已选择 ${selectedText.length} 个字符`}
              size="small"
              sx={{ 
                mt: 1,
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: 'white'
              }}
            />
          )}
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.grey[400], 0.4),
              borderRadius: 3,
            },
          }}
        >
          <List sx={{ p: 0 }}>
            {messages.map(renderMessage)}
            {isLoading && (
              <ListItem sx={{ justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 2 }} color="text.secondary">
                  {loadingMessage}
                </Typography>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {/* Function Selector with Quick Generate */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>AI 功能</InputLabel>
              <Select
                value={selectedFunction}
                onChange={(e: SelectChangeEvent) => setSelectedFunction(e.target.value)}
                label="AI 功能"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              >
                <MenuItem value="chat">💬 智能对话</MenuItem>
                <MenuItem value="summarize">📝 文档摘要</MenuItem>
                <MenuItem value="translate">🌐 文本翻译</MenuItem>
                <MenuItem value="explain">🎓 概念解释</MenuItem>
                <MenuItem value="qa">❓ 智能问答</MenuItem>
                <MenuItem value="optimize">✨ 内容优化</MenuItem>
                <MenuItem value="tags">🏷️ 生成标签</MenuItem>
                <MenuItem value="continue">✍️ 续写内容</MenuItem>
                <MenuItem value="rewrite">🔄 重写优化</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="快速生成">
              <IconButton
                onClick={handleQuickGenerate}
                disabled={isLoading || selectedFunction === 'chat'}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark,
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.grey[300],
                  },
                }}
              >
                <AutoIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Generated Content Preview */}
          {showPreview && generatedContent && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: 1, borderColor: 'grey.300' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  <PreviewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  生成的内容预览
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="接受并插入">
                    <IconButton size="small" onClick={handleAcceptGenerated} color="success">
                      <AcceptIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="拒绝">
                    <IconButton size="small" onClick={handleRejectGenerated} color="error">
                      <RejectIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Paper sx={{ p: 1.5, bgcolor: 'white', maxHeight: 150, overflow: 'auto' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {generatedContent}
                </Typography>
              </Paper>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RejectIcon />}
                  onClick={handleRejectGenerated}
                  color="error"
                >
                  拒绝
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AcceptIcon />}
                  onClick={handleAcceptGenerated}
                  color="success"
                >
                  接受并插入
                </Button>
              </Box>
            </Box>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', gap: 1 }}
          >
            <TextField
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholderText()}
              variant="outlined"
              size="small"
              fullWidth
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  bgcolor: theme.palette.grey[300],
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {getFunctionDescription()}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default AIChatSidebar;