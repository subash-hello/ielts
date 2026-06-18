const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attempts to use Hugging Face API as a last-resort fallback.
 */
async function callHuggingFaceFallback(promptOrParts) {
  console.log(`🚀 Gemini exhausted. Attempting Hugging Face Fallback API...`);
  
  // Extract text from the prompt payload
  let textPrompt = '';
  if (typeof promptOrParts === 'string') {
    textPrompt = promptOrParts;
  } else if (Array.isArray(promptOrParts)) {
    // Attempt to find the text part for multimodal prompts
    const textPart = promptOrParts.find(p => p.text);
    textPrompt = textPart ? textPart.text : JSON.stringify(promptOrParts);
  } else {
    textPrompt = JSON.stringify(promptOrParts);
  }
  
  const hfToken = process.env.HF_API_KEY;
  if (!hfToken) throw new Error('No HF_API_KEY available for fallback.');

  // Wrapping in an instruct format for Mixtral
  const formattedPrompt = `[INST] ${textPrompt} [/INST]`;

  const payload = {
    inputs: formattedPrompt,
    parameters: {
      max_new_tokens: 800,
      return_full_text: false,
      temperature: 0.5
    }
  };

  const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HF Fallback failed: ${response.status} ${errText}`);
  }

  const result = await response.json();
  let generatedText = '';
  if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
    generatedText = result[0].generated_text;
  } else {
    throw new Error('HF Fallback returned unexpected format.');
  }

  console.log('✅ Hugging Face Fallback generated a response successfully.');

  // Mock Gemini's result.response.text() structure so services don't break
  return {
    response: {
      text: () => generatedText
    }
  };
}

/**
 * Executes a Gemini request with automatic retries (exponential backoff)
 * and seamless fallback to alternative stable models if the primary model fails
 * due to rate limits (429) or high demand / service unavailability (503).
 */
async function generateContentWithRetryAndFallback(initialModelName, fallbackModels, promptOrParts, maxRetries = 3) {
  const modelsToTry = [initialModelName, ...fallbackModels];
  let lastError = null;

  for (const modelName of modelsToTry) {
    let delay = 1000; // start with 1 second delay
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Attempting Gemini content generation using model: ${modelName} (Attempt ${attempt}/${maxRetries})`);
        const modelInstance = genAI.getGenerativeModel({ model: modelName });
        const result = await modelInstance.generateContent(promptOrParts);
        
        // Basic check to see if we got a valid response
        if (result && result.response) {
          return result;
        }
      } catch (error) {
        lastError = error;
        const status = error.status || 
                       (error.message && error.message.includes('503') ? 503 : null) || 
                       (error.message && error.message.includes('429') ? 429 : null);
        
        console.warn(`⚠️ Error with model ${modelName} on attempt ${attempt}: ${error.message}`);
        
        // If it's a 503 (Service Unavailable/High demand) or 429 (Rate limit), wait and retry
        if (status === 503 || status === 429 || 
            error.message.includes('Service Unavailable') || 
            error.message.includes('high demand') || 
            error.message.includes('503') || 
            error.message.includes('429')) {
          
          if (attempt < maxRetries) {
            console.log(`⏳ Waiting ${delay}ms before retrying...`);
            await sleep(delay);
            delay *= 2; // exponential backoff
            continue;
          }
        }
        
        // For other errors (like 400 Bad Request or invalid auth), or if max retries exceeded,
        // move immediately to the next fallback model rather than retrying this model again.
        break;
      }
    }
  }

  // If we exhausted all Gemini models and retries, attempt Hugging Face Fallback
  try {
    return await callHuggingFaceFallback(promptOrParts);
  } catch (hfError) {
    console.error('❌ HF Fallback also failed:', hfError.message);
    throw lastError || new Error('Gemini API content generation failed after exhausting all fallbacks.');
  }
}

/**
 * Drop-in wrapper that mimics the standard GoogleGenerativeAI model class behavior
 * but adds robust retry and fallback resilience under the hood.
 */
class GenerativeModelWrapper {
  constructor(defaultModelName, fallbackModelNames = []) {
    this.defaultModelName = defaultModelName;
    this.fallbackModelNames = fallbackModelNames;
  }

  async generateContent(promptOrParts) {
    return generateContentWithRetryAndFallback(this.defaultModelName, this.fallbackModelNames, promptOrParts);
  }
}

// Regular model defaults to gemini-2.5-flash with fallback to stable models
const getModel = (modelName = 'gemini-2.5-flash') => {
  const fallbacks = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];
  // Filter out the primary model name if it's already in the fallbacks
  const filteredFallbacks = fallbacks.filter(f => f !== modelName);
  return new GenerativeModelWrapper(modelName, filteredFallbacks);
};

// Pro model defaults to gemini-2.5-pro with fallbacks to highly capable/stable models
const getProModel = () => {
  return new GenerativeModelWrapper('gemini-2.5-pro', ['gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-1.5-flash']);
};

module.exports = { genAI, getModel, getProModel };
