import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
let groq = null;

if (apiKey) {
  console.log('Groq API Key detected. Initializing AI tutor client...');
  groq = new Groq({ apiKey });
} else {
  console.log('No Groq API Key found. Running EduQuest AI Tutor in Mock AI Mode.');
}

/**
 * Generates an explanation or hint for a student based on a question.
 * @param {string} subject - The category/subject name (e.g., 'Math', 'Science')
 * @param {string} questionText - The actual question text
 * @param {string} defaultExplanation - The static explanation in the db
 * @returns {Promise<string>} An AI-generated or mock explanation (2 sentences max)
 */
export async function getAIExplanation(subject, questionText, defaultExplanation) {
  if (!groq) {
    // Mock AI mode: generates a friendly simulated explanation using the static database explanation
    return `EduBot Hint: ${defaultExplanation} Take your time and read the choices carefully—you got this!`;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are EduBot, an encouraging and friendly AI tutor for students. Explain the concept of the user\'s question in exactly two sentences. Be positive, clear, and age-appropriate. Do not give the direct answer index, but explain the underlying logic.'
        },
        {
          role: 'user',
          content: `Subject: ${subject}\nQuestion: ${questionText}\nExplanation Context: ${defaultExplanation}`
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 150
    });

    const reply = chatCompletion.choices[0]?.message?.content;
    return reply ? reply.trim() : `EduBot Hint: ${defaultExplanation}`;
  } catch (error) {
    console.error('Groq API Error:', error);
    // Graceful fallback to static explanation on API failures
    return `EduBot Hint: ${defaultExplanation} (API fallback)`;
  }
}
