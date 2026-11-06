import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';

// Helper to check API Key
function ensureApiKey(res: Response): boolean {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please set your Gemini API key in Settings > Secrets.',
    });
    return false;
  }
  return true;
}

// 1. AI Notes Generator
app.post('/api/generate-notes', async (req: Request, res: Response) => {
  if (!ensureApiKey(res)) return;
  const { topic, subject, depth, additionalInstructions } = req.body;

  if (!topic || typeof topic !== 'string') {
    res.status(400).json({ error: 'Topic is required.' });
    return;
  }

  try {
    const prompt = `You are an expert college professor and academic tutor preparing high-yield, structured study notes for first and second-year college students.
Topic: "${topic}"
Subject/Course: "${subject || 'General College Science/Engineering/Arts'}"
Detail Level: "${depth || 'Standard Comprehensive Notes'}"
Additional focus: "${additionalInstructions || 'None'}"

Please create comprehensive, beginner-accessible, well-structured college study notes in Markdown format.
Include:
1. # Topic Title with high-level 1-sentence synopsis
2. 📌 Key Learning Objectives (3-4 bullet points)
3. 📖 Core Definitions & Fundamental Concepts (clear, formal definition followed by beginner-friendly explanation)
4. 🔬 In-Depth Theoretical Breakdown (clear headings ##, subheadings ###, bullet points, key terms bolded)
5. 💡 Real-World Practical Examples & Real-Life Analogies (concrete examples college beginners can relate to)
6. ⚠️ Common Misconceptions & Pitfalls to Avoid in Exams
7. 📝 Formula / Key Syntax / Key Mechanism Cheat Sheet (if applicable)
8. ⚡ Quick Recap / Flashcard Summary (3-5 concise Q&A pairs for active recall revision)

Format everything cleanly with Markdown headings, lists, blockquotes, and code/math blocks where appropriate.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm, highly pedagogical college tutor who specializes in turning overwhelming college topics into clear, structured, high-retention notes.',
      },
    });

    res.json({
      success: true,
      notes: response.text || 'No notes generated. Please try again.',
      topic,
      subject,
    });
  } catch (err: any) {
    console.error('Error generating notes:', err);
    res.status(500).json({
      error: err?.message || 'Failed to generate study notes. Please check your prompt or API key.',
    });
  }
});

// 2. Simple Concept Explainer
app.post('/api/explain-concept', async (req: Request, res: Response) => {
  if (!ensureApiKey(res)) return;
  const { concept, field, style, studentYear } = req.body;

  if (!concept || typeof concept !== 'string') {
    res.status(400).json({ error: 'Concept is required.' });
    return;
  }

  try {
    const prompt = `You are a legendary college educator known for explaining the most confusing academic concepts so simply that any beginner immediately understands them.

Concept to explain: "${concept}"
Academic Field: "${field || 'College Academics'}"
Explanation Style: "${style || 'Intuitive & Relatable College Freshman'}"
Target Student: "${studentYear || '1st / 2nd Year College Beginner'}"

Structure the explanation into these clear sections using Markdown:
# 🎯 Understanding ${concept}
### 1. The 30-Second Elevator Pitch
A crystal-clear, jargon-free summary of what this actually is.

### 2. Why Does This Exist? (The Problem It Solves)
Explain the historical or practical problem that required this concept to be invented or studied.

### 3. The Big Analogy / Mental Model
Use a vivid, unforgettable real-life analogy (e.g. comparing to restaurants, sports, smartphones, campus life, cooking, traffic). Walk through how the parts correspond.

### 4. Step-by-Step Breakdown (No Jargon, Just Logic)
Explain how it actually works step-by-step. If technical terms are unavoidable, define them on the spot like a friendly mentor.

### 5. 2 Practical Real-World Applications
Where is this actually used in technology, industry, nature, or everyday life?

### 6. The "Gotcha!" – What Beginners Always Mix Up
The #1 trap students fall into on exams or lab assignments.

### 7. 🧠 Quick Intuition Check
A 1-question scenario to test if the student truly understands, with the answer hidden in a collapsible or spoiler format (or brief explanation below).`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    res.json({
      success: true,
      explanation: response.text || 'No explanation generated. Please try again.',
      concept,
    });
  } catch (err: any) {
    console.error('Error explaining concept:', err);
    res.status(500).json({
      error: err?.message || 'Failed to generate concept explanation. Please try again.',
    });
  }
});

// 3. AI Quiz Generator (Structured JSON response for interactive quiz taker)
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  if (!ensureApiKey(res)) return;
  const { topic, difficulty, questionCount = 5 } = req.body;

  if (!topic || typeof topic !== 'string') {
    res.status(400).json({ error: 'Topic is required.' });
    return;
  }

  try {
    const prompt = `Generate an interactive multiple-choice quiz with exactly 5 high-quality questions for college students (1st & 2nd year level) on the topic: "${topic}".
Difficulty level: "${difficulty || 'Beginner to Intermediate College'}".

Each question must have:
- A clear, thoughtful question text that tests understanding rather than mere memorization
- Exactly 4 options (labeled A, B, C, D)
- The exact correct option letter ('A', 'B', 'C', or 'D')
- A thorough explanation of why the correct option is right AND why the common distractors are incorrect
- A helpful hint for a struggling student`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            topic: { type: Type.STRING },
            overview: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING }, // "A", "B", "C", "D"
                        text: { type: Type.STRING },
                      },
                      required: ['label', 'text'],
                    },
                  },
                  correctAnswer: { type: Type.STRING }, // "A", "B", "C", or "D"
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['quizTitle', 'topic', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      quiz: parsed,
    });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    res.status(500).json({
      error: err?.message || 'Failed to generate quiz. Please try again.',
    });
  }
});

// 4. Important Question Generator (Revision practice questions with disclaimers & model answers)
app.post('/api/important-questions', async (req: Request, res: Response) => {
  if (!ensureApiKey(res)) return;
  const { subject, unitOrTopic, examFormat } = req.body;

  if (!subject && !unitOrTopic) {
    res.status(400).json({ error: 'Subject or Unit/Topic is required.' });
    return;
  }

  try {
    const prompt = `You are a veteran college professor preparing a high-value revision practice question bank for first and second year university students.
Subject: "${subject || 'College Syllabus'}"
Topic / Unit: "${unitOrTopic || 'General Core Syllabus'}"
Target Exam Style: "${examFormat || 'Semester Midterm / Final Examination'}"

CRITICAL MANDATE:
Explicitly format and label this as "Revision Practice Questions for Self-Assessment (NOT guaranteed exam leaks or official paper leaks)".

Provide a comprehensive revision question set categorized into:
1. 📌 **Section A: Short Answer / Concept Recall (2-3 Marks Questions)**
   - 4-5 high-yield short questions testing core definitions, laws, distinctions, or formulas
   - For EACH question, provide the concise Model Answer & Expected Key Points examiners look for.

2. 📖 **Section B: Medium Conceptual / Analytical (5-7 Marks Questions)**
   - 3-4 medium questions requiring explanations of mechanisms, comparisons, derivations, or algorithms
   - For EACH question, provide the Model Answer Outline, Key Diagrams/Flowcharts description, and Mark Distribution breakdown.

3. 🏆 **Section C: Long Answer / Comprehensive Problem Solving (10-15 Marks Questions)**
   - 2 deep questions testing architectural synthesis, comprehensive case study, or multi-step analysis
   - For EACH question, provide a step-by-step master solution guide and how to structure the exam answer to get maximum marks.

4. 💡 **Professor's High-Yield Exam Strategy & Common Traps**
   - 3 golden rules on how questions in this subject are typically framed
   - Mistakes that cost students 30-50% of their marks.

Render output in clean, readable Markdown with badges, bold terms, and structured sections.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic mentor providing student revision question banks with transparent model answers and clear practice disclaimers.',
      },
    });

    res.json({
      success: true,
      questions: response.text || 'No questions generated. Please try again.',
      subject,
      unitOrTopic,
    });
  } catch (err: any) {
    console.error('Error generating important questions:', err);
    res.status(500).json({
      error: err?.message || 'Failed to generate revision questions. Please try again.',
    });
  }
});

// 5. Code Explainer (Python, Java, C, C++, HTML/CSS/JS line by line)
app.post('/api/explain-code', async (req: Request, res: Response) => {
  if (!ensureApiKey(res)) return;
  const { code, language, focusArea } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code snippet is required.' });
    return;
  }

  try {
    const prompt = `You are a compassionate, expert Computer Science teaching assistant for college freshmen and sophomores.
Programming Language: "${language || 'Auto-detect'}"
Specific Student Question / Focus: "${focusArea || 'General line-by-line understanding'}"

Here is the code to explain:
\`\`\`${language || ''}
${code}
\`\`\`

Provide an in-depth, structured beginner-friendly breakdown in Markdown:
1. 💡 **High-Level Purpose**: What does this program or function accomplish in simple human terms?
2. 🔍 **Line-by-Line Walkthrough**:
   Go through every meaningful line or logical chunk with line numbers (Line 1, Line 2...), explaining what the syntax means, why that keyword is used, and what happens behind the scenes.
3. 📊 **Memory / Variable State Trace (Dry Run)**:
   Provide a step-by-step simulation with sample input (e.g. if x=5, show how variables change table-style).
4. ⏱️ **Time & Space Complexity**:
   Explain Big-O in intuitive language (e.g., O(n) means if input doubles, time doubles).
5. ⚠️ **Beginner Gotchas & Edge Cases**:
   Common errors beginners make with this syntax (off-by-one errors, null pointers, unclosed tags, indentation, etc.).
6. 🚀 **Pro Tip / Cleaner Alternative**:
   How a senior engineer or idiomatic programmer would write or optimize it.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    res.json({
      success: true,
      explanation: response.text || 'No code explanation generated. Please try again.',
      language,
    });
  } catch (err: any) {
    console.error('Error explaining code:', err);
    res.status(500).json({
      error: err?.message || 'Failed to explain code. Please try again.',
    });
  }
});

// 6. Study Planner (Realistic timetable based on subjects, daily hours, Pomodoro, spaced repetition)
app.post('/api/study-planner', async (req: Request, res: Response) => {
  if (!ensureApiKey(res)) return;
  const {
    subjects, // array of strings or string
    dailyHours, // number e.g. 3, 4, 6
    durationDays, // e.g. 7 days, 14 days, 3 days weekend
    preference, // "Morning Bird", "Night Owl", "Balanced"
    studyTechnique, // "Pomodoro (25/5)", "50/10 Rule", "Deep Work (90m)"
    examGoal, // "Midterms", "Finals", "Catching Up", "Daily Mastery"
  } = req.body;

  if (!subjects) {
    res.status(400).json({ error: 'At least one subject is required.' });
    return;
  }

  try {
    const prompt = `You are an elite academic success coach designing a realistic, high-efficiency, burnout-proof study timetable for a college student.

Student Parameters:
- Subjects: ${JSON.stringify(subjects)}
- Daily Available Study Hours: ${dailyHours || 4} hours per day
- Plan Duration: ${durationDays || '7-Day Sprint'}
- Student Peak Energy Time: ${preference || 'Balanced'}
- Preferred Focus Technique: ${studyTechnique || 'Pomodoro 25/5'}
- Core Goal: ${examGoal || 'Semester Exam Preparation'}

Generate a structured study plan as a JSON object matching the requested schema.
Rules:
- Be 100% REALISTIC. Never schedule 12 hours of uninterrupted reading.
- Include active recall, practice problem blocks, and spaced repetition review slots.
- Include mandatory 10-15 minute hydration and brain breaks.
- Create an actionable day-by-day timetable for the schedule.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            dailyTargetHours: { type: Type.NUMBER },
            strategyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING }, // "Day 1 (Monday)"
                  theme: { type: Type.STRING }, // "Foundation & Hardest Concepts"
                  totalHours: { type: Type.NUMBER },
                  blocks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeSlot: { type: Type.STRING }, // "09:00 AM - 10:00 AM"
                        subject: { type: Type.STRING },
                        activity: { type: Type.STRING }, // "Read Chapter 4 & Write Flashcards"
                        technique: { type: Type.STRING }, // "Pomodoro (2x 25m)"
                        priority: { type: Type.STRING }, // "High", "Medium", "Review"
                      },
                      required: ['timeSlot', 'subject', 'activity'],
                    },
                  },
                },
                required: ['day', 'theme', 'blocks'],
              },
            },
            retentionAdvice: { type: Type.STRING },
          },
          required: ['planTitle', 'summary', 'schedule'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      plan: parsed,
    });
  } catch (err: any) {
    console.error('Error generating study plan:', err);
    res.status(500).json({
      error: err?.message || 'Failed to generate study timetable. Please try again.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL_NAME,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
