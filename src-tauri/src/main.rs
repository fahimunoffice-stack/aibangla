// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod buffer;
mod ai_engine;
mod text_injector;
mod input_hook;
mod commands;

use config::{Mode, CONFIG};
use buffer::Buffer;
use ai_engine::AI_ENGINE;
use text_injector::INJECTOR;
use input_hook::{InputEvent, InputHook};
use commands::{AppState, get_config, save_config, set_mode, test_api_key, get_status, toggle_active, show_window, quit_app};

use std::sync::{Arc, Mutex};
use std::time::Instant;
use tauri::{Manager, WebviewWindow};
use tokio::runtime::Runtime;

struct AppData {
    buffer: Arc<Mutex<Buffer>>,
    last_correction_time: Arc<Mutex<Option<Instant>>>,
}

fn main() {
    // Initialize logging
    env_logger::init();

    // Load config early
    let _ = CONFIG.lock();

    // Create tokio runtime for async operations
    let rt = Arc::new(Runtime::new().expect("Failed to create Tokio runtime"));

    tauri::Builder::default()
        .manage(AppState::default())
        .manage(AppData {
            buffer: Arc::new(Mutex::new(Buffer::new())),
            last_correction_time: Arc::new(Mutex::new(None)),
        })
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let app_data: tauri::State<'_, AppData> = app.state();
            let buffer = app_data.buffer.clone();
            let last_correction_time = app_data.last_correction_time.clone();

            // Start input hook in a separate thread
            let (hook, receiver) = InputHook::new();
            hook.start();

            // Process input events
            let rt_clone = rt.clone();
            std::thread::spawn(move || {
                while let Ok(event) = receiver.recv() {
                    let config = CONFIG.lock().unwrap();

                    if config.mode == Mode::Disabled {
                        continue;
                    }

                    match event {
                        InputEvent::KeyPress(ch) => {
                            // Only process alphabetic characters and numbers
                            if ch.is_alphanumeric() {
                                buffer.lock().unwrap().push_char(ch);
                            }
                        }
                        InputEvent::Backspace => {
                            buffer.lock().unwrap().backspace();
                        }
                        InputEvent::Space => {
                            let should_trigger = config.trigger_on_space;
                            let word = buffer.lock().unwrap().get_current_word().to_string();

                            if should_trigger && !word.is_empty() {
                                let word_len = word.len();
                                let context = buffer.lock().unwrap().get_context();
                                let mode = config.mode.clone();
                                let api_key = config.groq_api_key.clone();
                                let model = config.model.clone();
                                let target_lang = config.target_language.clone();

                                // Clear buffer before async operation
                                buffer.lock().unwrap().clear();

                                // Process correction in async context
                                rt_clone.spawn(async move {
                                    if api_key.is_empty() {
                                        log::warn!("No API key configured");
                                        return;
                                    }

                                    let corrected = match mode {
                                        Mode::BengaliCorrection | Mode::Both => {
                                            AI_ENGINE.correct_phonetic(&word, &context, &api_key, &model).await
                                        }
                                        Mode::Translation => {
                                            AI_ENGINE.translate_text(&word, &target_lang, &api_key, &model).await
                                        }
                                        Mode::Disabled => return,
                                    };

                                    // Inject the corrected text
                                    INJECTOR.inject_correction(word_len, &corrected);

                                    // Update last correction time
                                    if let Ok(mut time) = last_correction_time.lock() {
                                        *time = Some(Instant::now());
                                    }
                                });
                            } else {
                                buffer.lock().unwrap().clear();
                            }
                        }
                        InputEvent::Enter => {
                            buffer.lock().unwrap().clear();
                        }
                        InputEvent::Punctuation(_) => {
                            buffer.lock().unwrap().clear();
                        }
                        InputEvent::Tab => {
                            buffer.lock().unwrap().clear();
                        }
                        InputEvent::Escape => {
                            buffer.lock().unwrap().force_clear();
                        }
                        _ => {}
                    }
                }
            });

            // Hide window initially (system tray only mode)
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            set_mode,
            test_api_key,
            get_status,
            toggle_active,
            show_window,
            quit_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
