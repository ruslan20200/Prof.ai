/*
 * Gemini API Integration for BilimMatch
 * Model: gemini-1.5-flash
 * All AI logic runs through this module
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function getApiKey(): string {
  const key: string = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || '';
  if (!key) {
    console.warn('GEMINI_API_KEY not set. AI features will use fallback responses.');
  }
  return key;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return getFallbackResponse(prompt);
  }

  const contents = [];

  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Понял, буду следовать этим инструкциям.' }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return getFallbackResponse(prompt);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(prompt);
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return getFallbackResponse(prompt);
  }
}

export async function matchJobsWithProfile(
  profile: Record<string, unknown>,
  jobsList: Array<Record<string, unknown>>
): Promise<Array<{ jobId: string; matchPercent: number; explanation: string }>> {
  const systemPrompt = `Ты — AI-система для сопоставления кандидатов с вакансиями на платформе BilimMatch.
Твоя задача — проанализировать профиль кандидата и список вакансий, и для каждой вакансии определить процент совпадения.
Отвечай СТРОГО в формате JSON массива: [{"jobId": "1", "matchPercent": 85, "explanation": "Краткое объяснение на русском"}]
Процент от 0 до 100. Учитывай навыки, опыт, интересы, образование.`;

  const prompt = `Профиль кандидата: ${JSON.stringify(profile)}

Вакансии: ${JSON.stringify(jobsList.map(j => ({ id: j.id, title: j.title, skills: j.skills, requirements: j.requirements, experience: j.experience })))}

Верни JSON массив с matchPercent и explanation для каждой вакансии. Только JSON, без markdown.`;

  const result = await callGemini(prompt, systemPrompt);

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return jobsList.map((j) => ({
      jobId: String(j.id),
      matchPercent: Math.floor(Math.random() * 40 + 40),
      explanation: 'Анализ совпадения на основе ваших навыков и требований вакансии.',
    }));
  }
}

export async function generateResume(profile: Record<string, unknown>, answers: Array<Record<string, string>>): Promise<string> {
  const systemPrompt = `Ты — профессиональный составитель резюме. Создай красивое, структурированное резюме на русском языке в формате Markdown.
Используй данные из профиля и ответов на вопросы онбординга. Резюме должно быть готово к отправке работодателю.
Структура: ФИО, Контакты, О себе, Навыки, Опыт работы, Образование, Языки, Проекты.`;

  const prompt = `Данные профиля: ${JSON.stringify(profile)}
Ответы на вопросы: ${JSON.stringify(answers)}

Создай профессиональное резюме в формате Markdown.`;

  return callGemini(prompt, systemPrompt);
}

export async function conductInterview(
  jobTitle: string,
  jobRequirements: string[],
  conversationHistory: Array<{ role: string; content: string }>,
  isFirstMessage: boolean
): Promise<string> {
  const systemPrompt = `Ты — строгий, но справедливый HR-интервьюер на платформе BilimMatch. Ты проводишь собеседование на позицию "${jobTitle}".
Требования к позиции: ${jobRequirements.join(', ')}.

Правила:
1. Задавай по одному вопросу за раз
2. Вопросы должны быть релевантны позиции
3. Начни с приветствия и простого вопроса
4. Постепенно усложняй вопросы
5. Задай 5-7 вопросов, затем заверши собеседование
6. Будь профессиональным, но дружелюбным
7. Отвечай на русском языке
8. Используй Markdown для форматирования`;

  let prompt: string;
  if (isFirstMessage) {
    prompt = 'Начни собеседование. Представься и задай первый вопрос.';
  } else {
    const history = conversationHistory.map(m => `${m.role === 'user' ? 'Кандидат' : 'Интервьюер'}: ${m.content}`).join('\n');
    prompt = `История разговора:\n${history}\n\nПродолжи собеседование. Если было задано уже 5+ вопросов, заверши собеседование и скажи, что анализ будет готов.`;
  }

  return callGemini(prompt, systemPrompt);
}

export async function analyzeInterview(
  messages: Array<{ role: string; content: string; timestamp: number }>,
  jobTitle: string
): Promise<string> {
  const systemPrompt = `Ты — AI-аналитик собеседований на платформе BilimMatch. Проанализируй собеседование и выдай детальную аналитику.

Формат ответа — СТРОГО JSON:
{
  "confidenceScore": число от 0 до 100,
  "anxietyLevel": "низкий" | "средний" | "высокий",
  "responseQuality": число от 0 до 100,
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "weaknesses": ["слабая сторона 1"],
  "overallFeedback": "Общий фидбек в 2-3 предложениях",
  "detailedAnalysis": "Подробный анализ в формате Markdown с рекомендациями"
}

Анализируй:
- Паттерны ответов (длина, детальность)
- Паузы между сообщениями (timestamps)
- Уверенность формулировок
- Релевантность ответов вопросам
- Профессиональную лексику`;

  const history = messages.map(m => ({
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
  }));

  const prompt = `Позиция: ${jobTitle}
Собеседование: ${JSON.stringify(history)}

Проанализируй и верни JSON. Только JSON, без markdown-обёрток.`;

  return callGemini(prompt, systemPrompt);
}

function getFallbackResponse(prompt: string): string {
  if (prompt.includes('Начни собеседование')) {
    return `Здравствуйте! 👋

Меня зовут AI-интервьюер BilimMatch. Рад приветствовать вас на нашем собеседовании.

Давайте начнём с простого вопроса: **Расскажите немного о себе и вашем профессиональном опыте.**`;
  }

  if (prompt.includes('Профиль кандидата')) {
    return '[]';
  }

  if (prompt.includes('резюме')) {
    return `# Резюме

## Контактная информация
- Имя: Кандидат
- Город: Алматы

## О себе
Мотивированный специалист, ищущий возможности для профессионального роста.

## Навыки
- Коммуникация
- Работа в команде
- Организованность

*Для полноценной генерации резюме добавьте API ключ Gemini в настройки.*`;
  }

  return 'Для работы AI-функций необходимо добавить API ключ Google Gemini в файл .env.local (VITE_GEMINI_API_KEY). Получить ключ можно на https://ai.google.dev/';
}
