'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { AIService } from '@/lib/openai';

interface AITestDialogProps {
  open: boolean;
  onClose: () => void;
}

const AITestDialog: React.FC<AITestDialogProps> = ({ open, onClose }) => {
  const [testText, setTestText] = useState('这是一个测试文本，用于验证AI功能是否正常工作。人工智能可以帮助我们总结文档、翻译文本、解释概念等。');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleTest = async () => {
    if (!testText.trim()) {
      setError('请输入测试文本');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setTestResult('');

    try {
      // 测试文档总结功能
      const result = await AIService.summarizeText(testText, { maxLength: 50 });
      
      if (result.error) {
        setError(result.error);
      } else {
        setTestResult(result.content);
        setSuccess(true);
      }
    } catch (err) {
      setError('测试失败：' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTestResult('');
    setError('');
    setSuccess(false);
    setTestText('这是一个测试文本，用于验证AI功能是否正常工作。人工智能可以帮助我们总结文档、翻译文本、解释概念等。');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">🤖 AI功能测试</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {/* 说明文本 */}
          <Alert severity="info">
            <Typography variant="body2">
              此测试将验证AI服务是否正确配置。测试将使用文档总结功能来验证连接。
            </Typography>
          </Alert>

          {/* API密钥状态检查 */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              🔑 AI服务配置状态：
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip 
                label={`提供商: ${process.env.NEXT_PUBLIC_AI_PROVIDER || 'OpenAI'}`}
                color="info"
                size="small"
              />
              <Chip 
                icon={
                  (process.env.NEXT_PUBLIC_AI_PROVIDER === 'deepseek' 
                    ? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY 
                    : process.env.NEXT_PUBLIC_OPENAI_API_KEY) 
                  ? <SuccessIcon /> : <ErrorIcon />
                }
                label={
                  (process.env.NEXT_PUBLIC_AI_PROVIDER === 'deepseek' 
                    ? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY 
                    : process.env.NEXT_PUBLIC_OPENAI_API_KEY) 
                  ? 'API密钥已配置' : 'API密钥未配置'
                } 
                color={
                  (process.env.NEXT_PUBLIC_AI_PROVIDER === 'deepseek' 
                    ? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY 
                    : process.env.NEXT_PUBLIC_OPENAI_API_KEY) 
                  ? 'success' : 'error'
                }
                size="small"
              />
            </Stack>
            {!(process.env.NEXT_PUBLIC_AI_PROVIDER === 'deepseek' 
                ? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY 
                : process.env.NEXT_PUBLIC_OPENAI_API_KEY) && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                请在 .env.local 文件中配置相应的API密钥
              </Typography>
            )}
          </Box>

          {/* 测试文本输入 */}
          <TextField
            label="测试文本"
            multiline
            rows={4}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            fullWidth
            placeholder="输入要测试的文本..."
          />

          {/* 测试结果 */}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                正在测试AI功能...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error">
              <Typography variant="body2">
                <strong>测试失败：</strong>{error}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                请检查：
                <br />• API密钥是否正确配置
                <br />• 网络连接是否正常  
                <br />• OpenAI账户是否有可用额度
              </Typography>
            </Alert>
          )}

          {success && testResult && (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>✅ AI功能测试成功！</strong>
              </Typography>
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>总结结果：</strong>{testResult}
                </Typography>
              </Box>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} disabled={loading}>
          重置
        </Button>
        <Button 
          onClick={handleTest} 
          variant="contained" 
          disabled={loading || !(process.env.NEXT_PUBLIC_AI_PROVIDER === 'deepseek' 
            ? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY 
            : process.env.NEXT_PUBLIC_OPENAI_API_KEY)}
        >
          {loading ? '测试中...' : '开始测试'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AITestDialog;