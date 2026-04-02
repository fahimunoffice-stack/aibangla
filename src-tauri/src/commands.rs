use crate::config::{Config, Mode, CONFIG};
use crate::ai_engine::AI_ENGINE;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStatus {
    pub mode: String,
    pub is_active: bool,
    pub last_correction: Option<String>,
    pub has_api_key: bool,
}

#[derive(Default)]
pub struct AppState {
    pub last_correction: Mutex<Option<String>>,
    pub is_active: Mutex<bool>,
}

#[tauri::command]
pub fn get_config() -> Config {
    let config = CONFIG.lock().unwrap();
    config.clone()
}

#[tauri::command]
pub fn save_config(config: Config) -> Result<(), String> {
    config.save();
    let mut global_config = CONFIG.lock().unwrap();
    *global_config = config;
    Ok(())
}

#[tauri::command]
pub fn set_mode(mode: String) -> Result<(), String> {
    let parsed_mode = match mode.as_str() {
        "bengali_correction" => Mode::BengaliCorrection,
        "translation" => Mode::Translation,
        "both" => Mode::Both,
        "disabled" => Mode::Disabled,
        _ => return Err(format!("Invalid mode: {}", mode)),
    };

    let mut config = CONFIG.lock().unwrap();
    config.mode = parsed_mode;
    config.save();
    Ok(())
}

#[tauri::command]
pub async fn test_api_key(key: String) -> bool {
    AI_ENGINE.test_api_key(&key).await
}

#[tauri::command]
pub fn get_status(state: State<'_, AppState>) -> AppStatus {
    let config = CONFIG.lock().unwrap();
    let last_correction = state.last_correction.lock().unwrap().clone();
    let is_active = *state.is_active.lock().unwrap();

    AppStatus {
        mode: format!("{:?}", config.mode),
        is_active,
        last_correction,
        has_api_key: !config.groq_api_key.is_empty(),
    }
}

#[tauri::command]
pub fn set_active(active: bool, state: State<'_, AppState>) {
    let mut is_active = state.is_active.lock().unwrap();
    *is_active = active;
}

#[tauri::command]
pub fn toggle_active(state: State<'_, AppState>) -> bool {
    let mut is_active = state.is_active.lock().unwrap();
    *is_active = !*is_active;
    *is_active
}

#[tauri::command]
pub fn show_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[tauri::command]
pub fn hide_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}

pub fn get_app_state(app: &AppHandle) -> Option<State<'_, AppState>> {
    app.try_state::<AppState>()
}
