/**
 * @flow
 */

import fetch from 'node-fetch'
import latex from 'node-latex'
import prettify from 'pretty-latex'
import Archiver from 'archiver'
import { stripIndent } from 'common-tags'
import getTemplateData from './templates'
import type { Transform } from 'stream'
import type { SanitizedValues } from '../types'

/**
 * Generates a LaTeX document from the request body,
 * and then generates a PDF from that document.
 *
 * @param formData The request body received from the client.
 *
 * @return The generated PDF.
 */

function generatePDF(formData: SanitizedValues): Transform {
  const { texDoc, opts } = getTemplateData(formData)
  const pdf = latex(texDoc, opts)

  return pdf
}

/**
 * Generates resume source files from the request body,
 * and then saves it to a zip which is then sent to the client.
 *
 * @param formData The request body received from the client.
 *
 * @return The generated zip.
 */

function generateSourceCode(formData: SanitizedValues): Transform {
  const { texDoc, opts = {} } = getTemplateData(formData)
  const prettyDoc = prettify(texDoc)
  const zip = Archiver('zip')
  const readme = makeReadme(formData.selectedTemplate, opts.cmd)

  zip.append(prettyDoc, { name: 'resume.tex' })
  zip.append(readme, { name: 'README.md' })

  if (opts.inputs) {
    zip.directory(opts.inputs, '../')
  }

  zip.finalize()

  return zip
}

/**
 * Generates a README to include in the output zip.
 * It details how to use the generated LaTeX source code.
 *
 * @param template The specified resume template.
 * @param cmd The LaTeX command that is used to generate the PDF.
 *
 * @return The generated README text.
 */

function makeReadme(template: number, cmd?: string = 'pdflatex'): string {
  return stripIndent`
    # Resumake Template ${template}
    > LaTeX code generated at [resumake.io](https://resumake.io)

    ## Usage
    To generate a PDF from this LaTeX code, navigate to this folder in a terminal and run:

        ${cmd} resume.tex

    ## Requirements
    You will need to have \`${cmd}\` installed on your machine.

    Alternatively, you can use a site like [ShareLaTeX](https://sharelatex.com) to build and edit your LaTeX instead.
  `
}

/**
 * System prompt for AI resume tailoring
 */
const TAILOR_SYSTEM_PROMPT = `You are an expert resume tailoring assistant. Your task is to intelligently optimize a resume for a specific job by:

1. **SELECTIVELY TAILORING** only the sections marked for modification
2. **STRATEGICALLY ORDERING** items by relevance within tailored sections
3. **SMART ENABLING/DISABLING** items based on job fit and impact

## TAILORING RULES:

### CONTENT PRESERVATION (CRITICAL):
- NEVER modify, rephrase, or change ANY text content
- NEVER edit company names, job titles, descriptions, highlights, keywords, or any other text
- NEVER add, remove, or alter any words, sentences, or phrases
- ONLY change the ORDER of items and the "enabled" boolean values
- Return ALL original data exactly as provided - every word must be identical

### SECTION-SPECIFIC BEHAVIOR:
- **Work Experience**: If enabled for tailoring, prioritize roles that demonstrate relevant skills and achievements. Keep chronological order but enable/disable strategically.
- **Skills**: If enabled, reorder by relevance to job requirements. Put most job-relevant skills first.
- **Projects**: If enabled, prioritize projects that showcase relevant technologies and impact.
- **Education**: If enabled, highlight relevant degrees/coursework first.
- **Awards**: If enabled, prioritize industry-relevant and recent awards.

### SMART ENABLEMENT STRATEGY:
- **Quality over Quantity**: Enable fewer, more relevant items rather than many mediocre ones
- **Relevance Scoring**: Rate each item's relevance to the job (skills match, industry alignment, seniority level)
- **Impact Focus**: Prioritize items that demonstrate measurable impact and leadership
- **Recency Bias**: When relevance is equal, prefer more recent experiences

### OPTIMIZATION GUIDELINES:
- **Work**: Enable 3-5 most relevant positions (focus on relevant technologies, similar roles, progression)
- **Skills**: Enable 4-6 most job-relevant skill categories (match job requirements closely)
- **Projects**: Enable 3-4 most impressive and relevant projects (showcase required technologies)
- **Education**: Enable relevant degrees and certifications (prioritize field-relevant education)
- **Awards**: Enable 2-4 most prestigious and relevant awards (industry recognition, recent achievements)

### RESPONSE FORMAT:
Return ONLY a valid JSON object with the resume data. For sections NOT marked for tailoring, return them exactly as received with no modifications.`;

/**
 * Creates the JSON schema for resume tailoring response
 */
function createTailorSchema(enabledSections) {
  return {
    type: 'json_schema',
    json_schema: {
      "name": "tailored_resume",
      "strict": true,
      "schema": {
        "type": "object",
        "description": "A resume containing professional, educational, and project history.",
        "properties": {
          "work": {
            "type": "array",
            "description": "List of work experiences.",
            "items": {
              "type": "object",
              "properties": {
                "company": { "type": "string", "description": "Name of the company." },
                "location": { "type": "string", "description": "Work location." },
                "position": { "type": "string", "description": "Job title." },
                "website": { "type": "string", "description": "Company website URL." },
                "startDate": { "type": "string", "description": "Start date of employment." },
                "endDate": { "type": "string", "description": "End date of employment." },
                "highlights": {
                  "type": "array",
                  "description": "List of key achievements or responsibilities.",
                  "items": { "type": "string" }
                },
                "enabled": { "type": "boolean", "description": "Whether this entry is enabled." }
              },
              "required": ["company", "location", "position", "website", "startDate", "endDate", "highlights", "enabled"]
            }
          },
          "education": {
            "type": "array",
            "description": "List of educational background.",
            "items": {
              "type": "object",
              "properties": {
                "institution": { "type": "string", "description": "Name of the institution." },
                "location": { "type": "string", "description": "Location of the institution." },
                "area": { "type": "string", "description": "Field of study or major." },
                "studyType": { "type": "string", "description": "Type of degree or certificate." },
                "startDate": { "type": "string", "description": "Start date of study." },
                "endDate": { "type": "string", "description": "End date or graduation date." },
                "gpa": { "type": "string", "description": "Grade Point Average." },
                "enabled": { "type": "boolean", "description": "Whether this entry is enabled." }
              },
              "required": ["institution", "location", "area", "studyType", "startDate", "endDate", "gpa", "enabled"]
            }
          },
          "skills": {
            "type": "array",
            "description": "List of skills.",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "description": "Name of the skill or skill category." },
                "level": { "type": "string", "description": "Proficiency level." },
                "keywords": {
                  "type": "array",
                  "description": "Specific keywords or technologies related to the skill.",
                  "items": { "type": "string" }
                },
                "enabled": { "type": "boolean", "description": "Whether this entry is enabled." }
              },
              "required": ["name", "level", "keywords", "enabled"]
            }
          },
          "projects": {
            "type": "array",
            "description": "List of projects.",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "description": "Name of the project." },
                "description": { "type": "string", "description": "Brief description of the project." },
                "url": { "type": "string", "description": "URL for the project." },
                "keywords": {
                  "type": "array",
                  "description": "Keywords or technologies used in the project.",
                  "items": { "type": "string" }
                },
                "enabled": { "type": "boolean", "description": "Whether this entry is enabled." }
              },
              "required": ["name", "description", "url", "keywords", "enabled"]
            }
          },
          "awards": {
            "type": "array",
            "description": "List of awards or honors.",
            "items": {
              "type": "object",
              "properties": {
                "title": { "type": "string", "description": "Title of the award." },
                "date": { "type": "string", "description": "Date the award was received." },
                "awarder": { "type": "string", "description": "The organization that gave the award." },
                "summary": { "type": "string", "description": "Summary of the award." },
                "enabled": { "type": "boolean", "description": "Whether this entry is enabled." }
              },
              "required": ["title", "date", "awarder", "summary", "enabled"]
            }
          }
        },
        "required": enabledSections
      }
    }
  };
}

/**
 * Creates the user prompt for AI resume tailoring
 */
function createTailorUserPrompt(jobDescription, enabledSections, filteredResumeData) {
  return `## JOB DESCRIPTION:
${jobDescription}

## SECTIONS TO TAILOR:
${enabledSections.join(', ')}

## RESUME DATA TO OPTIMIZE:
${JSON.stringify(filteredResumeData, null, 2)}

## INSTRUCTIONS:
- Reorder items within each section by relevance to the job
- Enable/disable items strategically for best job fit
- Keep all text content exactly identical - only change order and enabled flags
- Return only the sections provided above`;
}

/**
 * Tailors a resume based on a job description using AI.
 *
 * @param requestBody The request containing resume data, job description, and tailor sections.
 *
 * @return Promise that resolves to the tailored resume data.
 */
async function tailor(requestBody) {
  const { resumeData, jobDescription, tailorSections } = requestBody;
  
  // Filter resumeData to only include sections enabled for tailoring
  const filteredResumeData = {};
  const enabledSections = [];
  
  Object.entries(tailorSections || {}).forEach(([section, enabled]) => {
    if (enabled && resumeData[section]) {
      filteredResumeData[section] = resumeData[section];
      enabledSections.push(section);
    }
  });
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        provider: {
          require_parameters: true
        },
        messages: [
          {
            role: 'system',
            content: TAILOR_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: createTailorUserPrompt(jobDescription, enabledSections, filteredResumeData)
          }
        ],
        temperature: 0.0,
        response_format: createTailorSchema(enabledSections),
      }),
    });
    
    const data = await response.json();
    const tailoredSections = JSON.parse(data.choices[0].message.content);
    
    // Merge tailored sections back with original untouched sections
    const finalResult = Object.assign({}, resumeData);
    Object.keys(tailoredSections).forEach(section => {
      finalResult[section] = tailoredSections[section];
    });

    return finalResult;
  } catch (error) {
    throw new Error(`Tailor request failed: ${error.message}`);
  }
}

export { generatePDF, generateSourceCode, makeReadme, tailor }
