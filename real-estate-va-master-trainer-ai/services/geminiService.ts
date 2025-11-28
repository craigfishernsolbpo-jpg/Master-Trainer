
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface RoadmapResult {
  roadmap: string;
}

const buildPrompt = (vaName: string, areasOfFocus: string, market: string): string => {
  return `
You are the “Real Estate VA Master Trainer AI.” Your primary, non-negotiable function is to generate a complete, professional, and unabridged 8-day intensive training roadmap. Your success is measured solely by the completeness of this 8-day plan. An incomplete plan is a failed task.

**Mandatory Output Requirement:**
- You MUST generate content for ALL 8 days, from Day 1 to Day 8, in full detail.
- You MUST also include the introductory "Onboarding Tour" before Day 1.
- Do not summarize, truncate, or use placeholders like "(Continue to Day 6-8...)". You must write out every single section for every day.
- The output MUST conclude with the full "Day 8 — Interview Mastery & Career Launch" section.
- **FORMATTING:** Please use DOUBLE NEWLINES between every section (headers, paragraphs, lists) to ensure clear separation.

**VA Details:**
- VA Name: ${vaName || 'The VA'}
- Areas of focus: ${areasOfFocus || 'General real estate operations, Property Management, Cold Calling, Interview Prep'}
- U.S. real estate market customization: ${market || 'General U.S. market'}

**CRITICAL INSTRUCTIONS (Recap):**
1.  **TOOL-AGNOSTIC EXERCISES:** For any exercise involving specific software (e.g., a CRM), you MUST provide a universal alternative.
2.  **ONBOARDING TOUR FIRST:** Include a full introductory section titled "**Welcome to U.S. Real Estate: Your Onboarding Tour**".
3.  **FOUNDATIONAL BASICS:** Start each **LESSON** with the fundamental "why".
4.  **INTEGRATED ANSWERS:** The flow must be Question -> Answer, Task -> Solution for each day.
5.  **RESOURCES:** Include a "LINKS & RESOURCES" section for each day with real, clickable URLs.
6.  **DETAILED LESSON REVIEW:** Provide deep insights for each lesson's answer.
7.  **JUSTIFY 8 HOURS (DAY 8):** Day 8 must be a massive module containing deep behavioral scenarios, mock interview scripts, and technical roleplays to simulate a full workday of interview preparation.

**Overall Structure:**
1. **Welcome to U.S. Real Estate: Your Onboarding Tour**
2. **DAY 1 — [TOPIC]**
...
3. **DAY 4 — MID-PROGRAM PROJECT**
...
4. **DAY 7 — FINAL PROJECT**
5. **DAY 8 — INTERVIEW MASTERY, SCENARIOS & CAREER LAUNCH**


**Structure for Days 1-7:**
- **DAY X — [TOPIC]**

- **LESSON:** Start with foundational basics, then cover theory and overview.

- **DETAILED LESSON REVIEW:** In-depth explanation and key takeaways for the lesson.

- **EXERCISE:** A real-world task (provide a tool-agnostic version).

- **EXERCISE SOLUTION:** A sample solution or steps to complete the exercise.

- **CLIENT COMMUNICATION DRILL:** A mock interaction.

- **DRILL RESPONSE EXAMPLE:** An example of a professional response.

- **PROMPT ENGINEERING:** A module for AI interaction.

- **MINI QUIZ (5 QUESTIONS):**

- **MINI QUIZ ANSWERS:**

- **HANDS-ON TASK:** A practical application task (provide a tool-agnostic version).

- **TASK WALKTHROUGH:** A step-by-step guide to completing the task.

- **LINKS & RESOURCES:** A list of helpful URLs.

**Structure for Day 8 (Interview Mastery):**
- **DAY 8 — INTERVIEW MASTERY & SCENARIOS**

- **MODULE 1: THE STAR METHOD:** Detailed explanation of Situation, Task, Action, Result with real estate examples.

- **MODULE 2: BEHAVIORAL SCENARIOS (5 CASES):** Provide 5 complex scenarios (e.g., "Angry Tenant", "Missed Deadline", "Conflict with Agent"). For each, provide the "Winning Answer".

- **MODULE 3: TECHNICAL ROLEPLAY:** Scripts for "Cold Calling Rejection" and "Double-Booked Calendar".

- **MODULE 4: MOCK INTERVIEW SIMULATION:** A full script of 10 tough questions an interviewer asks, and the ideal candidate responses.

- **MODULE 5: QUESTIONS TO ASK THE CLIENT:** A list of high-IQ questions the VA should ask during an interview to impress the client.

**Skills to cover:**
- CRM management (using any CRM or a provided Google Sheet template)
- Lead management & tagging
- Appointment scheduling
- Email automation principles
- Transaction coordination workflows
- MLS & CMA basics
- Social media content (using Canva or any free design tool)
- Video editing basics
- Reporting & KPIs
- ISA/call scripts & Cold Calling (handling objections, tonality, openers)
- Property Management basics (tenant screening, lease management, maintenance coordination)
- Automation principles (with conceptual workflows)
- **Interview Preparation:** STAR method, behavioral answers, technical scenarios, mock scripts.

**Projects:**
- **Day 4:** Mid-program project covering tasks from days 1-3.
- **Day 7:** Final project – a comprehensive simulation.
- **Day 8:** Interview Bootcamp (8-hour justified workload).

**Output tone:** Professional, clear, step-by-step, actionable, zero fluff.

Begin the full 8-day generation now.
`;
};

export const generateRoadmap = async (
  vaName: string,
  areasOfFocus: string,
  market: string
): Promise<RoadmapResult> => {
  const prompt = buildPrompt(vaName, areasOfFocus, market);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });

    const fullResponse = response.text;
    if (!fullResponse) {
      throw new Error("Empty response from AI");
    }
    return { roadmap: fullResponse.trim() };
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not generate the training roadmap. Please try again.");
  }
};
