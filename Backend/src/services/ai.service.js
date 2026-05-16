const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}`;

  // We use a literal template here because Llama-3 understands this much better than Zod schemas
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

async function generatePdfFromHtml(htmlContent) {
  // Add these arguments to fix the Render/Linux crash
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
    ],
    // This uses the path provided by the Render environment if available
    executablePath: null,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body", { visible: true });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true, // Ensures CSS colors/images appear in the PDF
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
        content: `You are an expert resume writer. Output ONLY a valid JSON object matching this exact structure: { "html": "<html>...</html>" }. Do not use markdown wrapping.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const jsonContent = JSON.parse(response.choices[0].message.content);
  console.log("=== GROQ GENERATED HTML CONTENT ===", jsonContent.html);
  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
