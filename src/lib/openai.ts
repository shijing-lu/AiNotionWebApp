import OpenAI from 'openai';

// 检查AI服务提供商配置
const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai';
const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const deepseekKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

// 根据配置选择API密钥和基础URL
let apiKey: string;
let baseURL: string;
let modelName: string;

if (aiProvider === 'deepseek') {
  apiKey = deepseekKey || '';
  baseURL = 'https://api.deepseek.com';
  modelName = 'deepseek-chat';
  console.log('🚀 使用DeepSeek AI服务');
} else {
  apiKey = openaiKey || '';
  baseURL = 'https://api.openai.com/v1';
  modelName = 'gpt-3.5-turbo';
  console.log('🤖 使用OpenAI服务');
}

if (!apiKey) {
  console.warn(`⚠️ ${aiProvider.toUpperCase()} API密钥未配置，AI功能将无法使用`);
}

// 创建AI客户端实例
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  dangerouslyAllowBrowser: true, // 允许在浏览器中使用（仅用于演示）
});

// 添加调试信息
console.log(`🔑 ${aiProvider.toUpperCase()} API Key status:`, apiKey ? `已配置 (${apiKey.slice(0, 7)}...${apiKey.slice(-4)})` : '未配置');
console.log(`🌐 API Base URL: ${baseURL}`);
console.log(`🧠 Model: ${modelName}`);

export interface AIResponse {
  content: string;
  error?: string;
}

export interface SummarizeOptions {
  maxLength?: number;
  language?: 'zh' | 'en';
}

export interface TranslateOptions {
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface ExplainOptions {
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'zh' | 'en';
}

// AI助手服务类
export class AIService {
  // 文档总结功能
  static async summarizeText(text: string, options: SummarizeOptions = {}): Promise<AIResponse> {
    try {
      const { maxLength = 200, language = 'zh' } = options;
      
      const prompt = language === 'zh' 
        ? `请为以下文本生成一个简洁的摘要，不超过${maxLength}字：\n\n${text}`
        : `Please generate a concise summary of the following text, no more than ${maxLength} words:\n\n${text}`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: language === 'zh' 
              ? '你是一个专业的文档总结助手，能够提取文本的核心要点并生成简洁的摘要。'
              : 'You are a professional document summarization assistant that can extract key points and generate concise summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.min(maxLength * 2, 500),
        temperature: 0.3,
      });

      return {
        content: response.choices[0]?.message?.content || '无法生成摘要'
      };
    } catch (error: any) {
      console.error('AI summarization error:', error);
      
      // 提供更具体的错误信息
      let errorMessage = '生成摘要时发生错误';
      
      if (error?.error?.type === 'invalid_request_error') {
        errorMessage = 'API请求无效，请检查API密钥格式';
      } else if (error?.status === 401) {
        errorMessage = 'API密钥无效或未授权，请检查API配置';
      } else if (error?.status === 429) {
        errorMessage = 'API调用频率超限或余额不足';
      } else if (error?.status === 500) {
        errorMessage = 'OpenAI服务器错误，请稍后重试';
      } else if (!apiKey) {
        errorMessage = 'API密钥未配置，请在.env.local文件中设置NEXT_PUBLIC_OPENAI_API_KEY';
      }
      
      return {
        content: '',
        error: errorMessage
      };
    }
  }

  // 文本翻译功能
  static async translateText(text: string, options: TranslateOptions): Promise<AIResponse> {
    try {
      const { targetLanguage, sourceLanguage = 'auto' } = options;
      
      const prompt = `请将以下文本翻译成${targetLanguage}：\n\n${text}`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手，能够准确翻译各种语言的文本，保持原文的语义和语调。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      return {
        content: response.choices[0]?.message?.content || '翻译失败'
      };
    } catch (error) {
      console.error('AI translation error:', error);
      return {
        content: '',
        error: '翻译时发生错误，请检查API配置'
      };
    }
  }

  // 概念解释功能
  static async explainConcept(concept: string, context: string = '', options: ExplainOptions = {}): Promise<AIResponse> {
    try {
      const { level = 'intermediate', language = 'zh' } = options;
      
      const levelText = {
        beginner: language === 'zh' ? '初学者' : 'beginner',
        intermediate: language === 'zh' ? '中级' : 'intermediate', 
        advanced: language === 'zh' ? '高级' : 'advanced'
      };

      const prompt = language === 'zh'
        ? `请为${levelText[level]}解释以下概念："${concept}"${context ? `\n\n上下文：${context}` : ''}\n\n请提供清晰、易懂的解释，包括定义、应用场景和相关示例。`
        : `Please explain the following concept for a ${levelText[level]} level: "${concept}"${context ? `\n\nContext: ${context}` : ''}\n\nProvide a clear, understandable explanation including definition, use cases, and relevant examples.`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: language === 'zh'
              ? '你是一个知识渊博的教育助手，擅长用简单易懂的方式解释复杂概念。'
              : 'You are a knowledgeable educational assistant who excels at explaining complex concepts in simple, understandable ways.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
      });

      return {
        content: response.choices[0]?.message?.content || '无法解释该概念'
      };
    } catch (error) {
      console.error('AI explanation error:', error);
      return {
        content: '',
        error: '解释概念时发生错误，请检查API配置'
      };
    }
  }

  // 智能问答功能
  static async askQuestion(question: string, context: string = ''): Promise<AIResponse> {
    try {
      const prompt = `基于以下上下文回答问题：\n\n上下文：\n${context}\n\n问题：${question}`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个智能助手，能够基于提供的上下文准确回答用户的问题。如果上下文中没有足够信息，请诚实说明。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.2,
      });

      return {
        content: response.choices[0]?.message?.content || '无法回答该问题'
      };
    } catch (error) {
      console.error('AI Q&A error:', error);
      return {
        content: '',
        error: '回答问题时发生错误，请检查API配置'
      };
    }
  }

  // 内容优化功能
  static async optimizeContent(text: string, style: 'formal' | 'casual' | 'academic' | 'creative' = 'formal'): Promise<AIResponse> {
    try {
      const styleDescriptions = {
        formal: '正式、专业的风格',
        casual: '轻松、口语化的风格',
        academic: '学术、严谨的风格',
        creative: '创意、生动的风格'
      };

      const prompt = `请将以下文本改写为${styleDescriptions[style]}，保持原意不变：\n\n${text}`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的文本编辑助手，能够根据要求调整文本的风格和表达方式。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.6,
      });

      return {
        content: response.choices[0]?.message?.content || '优化失败'
      };
    } catch (error) {
      console.error('AI optimization error:', error);
      return {
        content: '',
        error: '优化内容时发生错误，请检查API配置'
      };
    }
  }

  // 自动标签生成
  static async generateTags(text: string, maxTags: number = 5): Promise<string[]> {
    try {
      const prompt = `请为以下文本生成${maxTags}个相关的标签关键词，用逗号分隔：\n\n${text}`;

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个标签生成助手，能够为文本内容生成准确、相关的标签关键词。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.3,
      });

      const tagsText = response.choices[0]?.message?.content || '';
      return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error('AI tag generation error:', error);
      return [];
    }
  }
}

export default AIService;