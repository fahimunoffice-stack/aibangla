use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Mode {
    #[serde(rename = "bengali_correction")]
    BengaliCorrection,
    #[serde(rename = "translation")]
    Translation,
    #[serde(rename = "both")]
    Both,
    #[serde(rename = "disabled")]
    Disabled,
}

impl Default for Mode {
    fn default() -> Self {
        Mode::BengaliCorrection
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub groq_api_key: String,
    #[serde(default = "default_model")]
    pub model: String,
    #[serde(default)]
    pub mode: Mode,
    #[serde(default = "default_language")]
    pub target_language: String,
    #[serde(default = "default_true")]
    pub trigger_on_space: bool,
    #[serde(default = "default_true")]
    pub show_preview: bool,
    #[serde(default = "default_hotkey")]
    pub hotkey_toggle: String,
}

fn default_model() -> String {
    "gpt-oss-120b".to_string()
}

fn default_language() -> String {
    "Bengali".to_string()
}

fn default_true() -> bool {
    true
}

fn default_hotkey() -> String {
    "Ctrl+Shift+B".to_string()
}

impl Default for Config {
    fn default() -> Self {
        Config {
            groq_api_key: String::new(),
            model: default_model(),
            mode: Mode::default(),
            target_language: default_language(),
            trigger_on_space: true,
            show_preview: true,
            hotkey_toggle: default_hotkey(),
        }
    }
}

impl Config {
    pub fn config_path() -> PathBuf {
        let app_dir = dirs::config_dir()
            .expect("Failed to get config directory")
            .join("aibangla");
        fs::create_dir_all(&app_dir).expect("Failed to create config directory");
        app_dir.join("config.json")
    }

    pub fn load() -> Self {
        let path = Self::config_path();
        if path.exists() {
            let content = fs::read_to_string(&path).expect("Failed to read config file");
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            let config = Config::default();
            config.save();
            config
        }
    }

    pub fn save(&self) {
        let path = Self::config_path();
        let content = serde_json::to_string_pretty(self).expect("Failed to serialize config");
        fs::write(&path, content).expect("Failed to write config file");
    }
}

pub static CONFIG: Lazy<Mutex<Config>> = Lazy::new(|| Mutex::new(Config::load()));
