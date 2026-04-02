use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;

const GROQ_API_URL: &str = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_SECS: u64 = 3;

#[derive(Debug, Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct ChatChoice {
    message: ChatMessageResponse,
}

#[derive(Debug, Deserialize)]
struct ChatMessageResponse {
    content: String,
}

#[derive(Debug, Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

pub struct AiEngine {
    client: Client,
    cache: Mutex<HashMap<String, String>>,
}

impl AiEngine {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
            .build()
            .expect("Failed to create HTTP client");

        AiEngine {
            client,
            cache: Mutex::new(HashMap::new()),
        }
    }

    fn get_cache_key(word: &str, context: &str, mode: &str) -> String {
        format!("{}:{}:{}", mode, context, word)
    }

    pub async fn correct_phonetic(&self, word: &str, context: &str, api_key: &str, model: &str) -> String {
        let cache_key = Self::get_cache_key(word, context, "correct");

        {
            let cache = self.cache.lock().unwrap();
            if let Some(cached) = cache.get(&cache_key) {
                return cached.clone();
            }
        }

        let system_prompt = "You are a Bengali phonetic corrector. Convert the romanized Bengali phonetic input to proper Bengali Unicode script. Input may have typos or variations. Return ONLY the Bengali Unicode text, nothing else. No explanation.";

        let user_prompt = if context.is_empty() {
            format!("Convert: {}", word)
        } else {
            format!("Context: {}\nConvert: {}", context, word)
        };

        let result = self.call_api(system_prompt, &user_prompt, api_key, model).await;

        let corrected = result.unwrap_or_else(|| basic_phonetic_map(word));

        {
            let mut cache = self.cache.lock().unwrap();
            cache.insert(cache_key, corrected.clone());
        }

        corrected
    }

    pub async fn translate_text(&self, text: &str, target_lang: &str, api_key: &str, model: &str) -> String {
        let cache_key = Self::get_cache_key(text, target_lang, "translate");

        {
            let cache = self.cache.lock().unwrap();
            if let Some(cached) = cache.get(&cache_key) {
                return cached.clone();
            }
        }

        let system_prompt = format!(
            "You are a translator. Translate the given text to {}. Return ONLY the translated text, nothing else.",
            target_lang
        );

        let result = self.call_api(&system_prompt, text, api_key, model).await;

        let translated = result.unwrap_or_else(|| text.to_string());

        {
            let mut cache = self.cache.lock().unwrap();
            cache.insert(cache_key, translated.clone());
        }

        translated
    }

    async fn call_api(&self, system_prompt: &str, user_prompt: &str, api_key: &str, model: &str) -> Option<String> {
        let request = ChatRequest {
            model: model.to_string(),
            messages: vec![
                ChatMessage {
                    role: "system".to_string(),
                    content: system_prompt.to_string(),
                },
                ChatMessage {
                    role: "user".to_string(),
                    content: user_prompt.to_string(),
                },
            ],
            temperature: 0.1,
            max_tokens: 100,
        };

        let response = self.client
            .post(GROQ_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await;

        match response {
            Ok(resp) => {
                if let Ok(chat_resp) = resp.json::<ChatResponse>().await {
                    if let Some(choice) = chat_resp.choices.first() {
                        return Some(choice.message.content.trim().to_string());
                    }
                }
            }
            Err(e) => {
                log::error!("API call failed: {}", e);
            }
        }

        None
    }

    pub async fn test_api_key(&self, api_key: &str) -> bool {
        let request = ChatRequest {
            model: "gpt-oss-120b".to_string(),
            messages: vec![
                ChatMessage {
                    role: "system".to_string(),
                    content: "Say 'OK'".to_string(),
                },
                ChatMessage {
                    role: "user".to_string(),
                    content: "Test".to_string(),
                },
            ],
            temperature: 0.1,
            max_tokens: 10,
        };

        let response = self.client
            .post(GROQ_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await;

        matches!(response, Ok(resp) if resp.status().is_success())
    }
}

impl Default for AiEngine {
    fn default() -> Self {
        Self::new()
    }
}

fn basic_phonetic_map(input: &str) -> String {
    let mut result = String::new();
    let mut chars = input.chars().peekable();

    while let Some(ch) = chars.next() {
        let mapped = match ch.to_ascii_lowercase() {
            'a' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'a' {
                        chars.next();
                        "আ"
                    } else if next.to_ascii_lowercase() == 'i' {
                        chars.next();
                        "ঐ"
                    } else if next.to_ascii_lowercase() == 'u' {
                        chars.next();
                        "ঔ"
                    } else {
                        "অ"
                    }
                } else {
                    "অ"
                }
            }
            'b' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ভ"
                    } else {
                        "ব"
                    }
                } else {
                    "ব"
                }
            }
            'c' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ছ"
                    } else {
                        "ক"
                    }
                } else {
                    "ক"
                }
            }
            'd' => {
                if let Some(&next) = chars.peek() {
                    match next.to_ascii_lowercase() {
                        'h' => { chars.next(); "ধ" }
                        'z' => { chars.next(); "য" }
                        _ => "দ"
                    }
                } else {
                    "দ"
                }
            }
            'e' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'e' {
                        chars.next();
                        "ঈ"
                    } else {
                        "এ"
                    }
                } else {
                    "এ"
                }
            }
            'f' => "ফ",
            'g' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ঘ"
                    } else {
                        "গ"
                    }
                } else {
                    "গ"
                }
            }
            'h' => "হ",
            'i' => "ই",
            'j' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ঝ"
                    } else {
                        "জ"
                    }
                } else {
                    "জ"
                }
            }
            'k' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "খ"
                    } else if next.to_ascii_lowercase() == 's' {
                        chars.next();
                        "ক্ষ"
                    } else {
                        "ক"
                    }
                } else {
                    "ক"
                }
            }
            'l' => "ল",
            'm' => "ম",
            'n' => {
                if let Some(&next) = chars.peek() {
                    match next.to_ascii_lowercase() {
                        'g' => { chars.next(); "ঙ" }
                        'y' => { chars.next(); "ঞ" }
                        _ => "ন"
                    }
                } else {
                    "ন"
                }
            }
            'o' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'o' {
                        chars.next();
                        "ও"
                    } else if next.to_ascii_lowercase() == 'i' {
                        chars.next();
                        "ঐ"
                    } else if next.to_ascii_lowercase() == 'u' {
                        chars.next();
                        "ঔ"
                    } else {
                        "ও"
                    }
                } else {
                    "ও"
                }
            }
            'p' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ফ"
                    } else {
                        "প"
                    }
                } else {
                    "প"
                }
            }
            'q' => "ক",
            'r' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'r' {
                        chars.next();
                        "ড়"
                    } else if next.to_ascii_lowercase() == 'z' {
                        chars.next();
                        "র"
                    } else if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ঢ"
                    } else {
                        "র"
                    }
                } else {
                    "র"
                }
            }
            's' => {
                if let Some(&next) = chars.peek() {
                    match next.to_ascii_lowercase() {
                        'h' => { chars.next(); "শ" }
                        's' => { chars.next(); "ষ" }
                        't' => { chars.next(); "স্ট" }
                        _ => "স"
                    }
                } else {
                    "স"
                }
            }
            't' => {
                if let Some(&next) = chars.peek() {
                    match next.to_ascii_lowercase() {
                        'h' => { chars.next(); "থ" }
                        't' => { chars.next(); "ৎ" }
                        _ => "ত"
                    }
                } else {
                    "ত"
                }
            }
            'u' => "উ",
            'v' => "ভ",
            'w' => "ও",
            'x' => "ক্স",
            'y' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'a' {
                        chars.next();
                        "য়া"
                    } else {
                        "য়"
                    }
                } else {
                    "য়"
                }
            }
            'z' => {
                if let Some(&next) = chars.peek() {
                    if next.to_ascii_lowercase() == 'h' {
                        chars.next();
                        "ঝ"
                    } else {
                        "য"
                    }
                } else {
                    "য"
                }
            }
            _ => &ch.to_string(),
        };
        result.push_str(mapped);
    }

    result
}

pub static AI_ENGINE: Lazy<AiEngine> = Lazy::new(AiEngine::new);
