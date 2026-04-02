use enigo::{Enigo, Keyboard, Settings};
use std::sync::Mutex;
use once_cell::sync::Lazy;

pub struct TextInjector {
    enigo: Mutex<Enigo>,
}

impl TextInjector {
    pub fn new() -> Self {
        let settings = Settings::default();
        let enigo = Enigo::new(&settings).expect("Failed to create Enigo instance");

        TextInjector {
            enigo: Mutex::new(enigo),
        }
    }

    pub fn inject_correction(&self, original_len: usize, corrected: &str) {
        let mut enigo = self.enigo.lock().unwrap();

        // Delete original characters
        for _ in 0..original_len {
            let _ = enigo.key(enigo::Key::Backspace, enigo::Direction::Click);
        }

        // Type corrected text
        let _ = enigo.text(corrected);
    }

    pub fn delete_chars(&self, count: usize) {
        let mut enigo = self.enigo.lock().unwrap();
        for _ in 0..count {
            let _ = enigo.key(enigo::Key::Backspace, enigo::Direction::Click);
        }
    }

    pub fn type_text(&self, text: &str) {
        let mut enigo = self.enigo.lock().unwrap();
        let _ = enigo.text(text);
    }
}

impl Default for TextInjector {
    fn default() -> Self {
        Self::new()
    }
}

pub static INJECTOR: Lazy<TextInjector> = Lazy::new(TextInjector::new);
