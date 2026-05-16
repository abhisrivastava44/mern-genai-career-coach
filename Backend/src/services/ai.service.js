const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * @description Generates a structured career/interview coaching report from Groq
 */
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}`;

  const expectedStructure = {
    matchScore: 85,
    title: "Job Title",
    technicalQuestions: [
      {
        question: "Sample technical question?",
        intention: "Why ask this?",
        answer: "Expected answer approach",
      },
    ],
    behavioralQuestions: [
      {
        question: "Sample behavioral question?",
        intention: "Why ask this?",
        answer: "Expected answer approach",
      },
    ],
    skillGaps: [
      {
        skill: "Name of missing skill",
        severity: "medium", // Must be low, medium, or high
      },
    ],
    preparationPlan: [
      {
        day: 1,
        focus: "Main topic to study",
        tasks: ["Specific task 1", "Specific task 2"],
      },
    ],
  };

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert technical interviewer and career coach. You MUST output your response strictly in valid JSON format. Do not include any text outside the JSON object. Your JSON MUST EXACTLY match this structure and contain all of these root keys:\n${JSON.stringify(expectedStructure, null, 2)}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * @description Initializes Puppeteer instance locally to compile raw HTML text layouts into PDFs
 */
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
    ],
    executablePath: null,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body", { visible: true });

  // Native injection safely overrides dark-themed text or transparency styles
  await page.addStyleTag({
    content: `
      html, body {
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      h1, h2, h3, h4, h5, h6, p, span, li, a, div, strong, em {
        color: #000000 !important;
        background-color: transparent !important;
      }
    `,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return pdfBuffer;
}

/**
 * @description Prompts Groq to tailor an HTML resume, sanitizes output blocks, and hands off to PDF compiler
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate resume for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

The response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF.
The resume should be tailored for the given job description. Use inline CSS. Make it ATS friendly and 1-2 pages long.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer. Output ONLY a valid JSON object matching this exact structure: { "html": "<html>...</html>" }. Crucial: The string value inside the "html" key must contain raw HTML text only, with NO markdown code block wrappers (do not use \`\`\`html).`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const rawResponseText = response.choices[0].message.content;
  let cleanHtml = "";

  try {
    const jsonContent = JSON.parse(rawResponseText);
    cleanHtml = jsonContent.html || "";
  } catch (parseError) {
    console.error(
      "Fallback parsing triggered. Recovering raw HTML layout tags...",
      parseError,
    );
    // FALLBACK PROTECTION: If JSON formatting breaks, parse whatever sits between the <html> tags directly
    const htmlMatch = rawResponseText.match(/<html>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      cleanHtml = htmlMatch[0];
    }
  }

  // Clear markdown code blocks or edge case backticks
  cleanHtml = cleanHtml.replace(/^```html\s*|```$/g, "").trim();

  // EMERGENCY FALLBACK: If the payload is empty, generate a structural template using the profile variables
  if (!cleanHtml || cleanHtml.length < 50) {
    console.warn(
      "Using fallback baseline view template to prevent empty page generation.",
    );
    cleanHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Resume</title></head>
        <body style="font-family: Arial, sans-serif; padding: 30px; color: #000000; background-color: #ffffff;">
          <h1 style="text-align: center; margin-bottom: 5px;">Resume Document</h1>
          <hr style="border: 1px solid #2a3348; margin-bottom: 20px;" />
          <h3>Profile Overview</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${selfDescription || "Profile structure parsing completed."}</p>
        </body>
      </html>
    `;
  }

  const pdfBuffer = await generatePdfFromHtml(cleanHtml);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
