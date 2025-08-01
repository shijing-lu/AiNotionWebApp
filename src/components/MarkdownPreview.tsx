'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Link,
} from '@mui/material';
import { MarkdownPreviewProps } from '@/types/note';

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className }) => {
  if (!content.trim()) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        <Typography variant="body1">
          Nothing to preview. Start writing in the editor to see the preview here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
        minHeight: 0, // 允许内容缩小
        '& h1': {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          marginTop: '2rem',
          borderBottom: '2px solid',
          borderColor: 'divider',
          paddingBottom: '0.5rem',
        },
        '& h2': {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          marginTop: '1.5rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          paddingBottom: '0.25rem',
        },
        '& h3': {
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          marginTop: '1rem',
        },
        '& h4, & h5, & h6': {
          fontSize: '1rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          marginTop: '1rem',
        },
        '& p': {
          marginBottom: '1rem',
          lineHeight: 1.6,
        },
        '& ul, & ol': {
          marginBottom: '1rem',
          paddingLeft: '2rem',
        },
        '& li': {
          marginBottom: '0.25rem',
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: '1rem',
          fontStyle: 'italic',
          backgroundColor: 'grey.50',
          padding: '1rem',
          marginBottom: '1rem',
        },
        '& code': {
          backgroundColor: 'grey.100',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        },
        '& pre': {
          backgroundColor: 'grey.900',
          padding: '1rem',
          borderRadius: '0.5rem',
          overflow: 'auto',
          marginBottom: '1rem',
        },
        '& pre code': {
          backgroundColor: 'transparent',
          padding: 0,
          color: 'white',
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid',
          borderColor: 'divider',
          margin: '2rem 0',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          table({ children }: any) {
            return (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  {children}
                </Table>
              </TableContainer>
            );
          },
          thead({ children }: any) {
            return <TableHead>{children}</TableHead>;
          },
          tbody({ children }: any) {
            return <TableBody>{children}</TableBody>;
          },
          tr({ children }: any) {
            return <TableRow>{children}</TableRow>;
          },
          td({ children }: any) {
            return <TableCell>{children}</TableCell>;
          },
          th({ children }: any) {
            return <TableCell component="th" scope="col" sx={{ fontWeight: 'bold' }}>
              {children}
            </TableCell>;
          },
          input({ type, checked, ...props }: any) {
            if (type === 'checkbox') {
              return (
                <Checkbox
                  checked={checked || false}
                  disabled
                  size="small"
                  sx={{ p: 0, mr: 1 }}
                />
              );
            }
            return <input type={type} checked={checked} {...props} />;
          },
          a({ href, children }: any) {
            return (
              <Link href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </Link>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownPreview;