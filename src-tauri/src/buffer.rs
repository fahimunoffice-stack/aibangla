pub struct Buffer {
    current_word: String,
    context: Vec<String>,
    max_context: usize,
}

impl Buffer {
    pub fn new() -> Self {
        Buffer {
            current_word: String::new(),
            context: Vec::new(),
            max_context: 5,
        }
    }

    pub fn push_char(&mut self, ch: char) {
        self.current_word.push(ch);
    }

    pub fn backspace(&mut self) {
        self.current_word.pop();
    }

    pub fn clear(&mut self) {
        if !self.current_word.is_empty() {
            self.context.push(self.current_word.clone());
            if self.context.len() > self.max_context {
                self.context.remove(0);
            }
        }
        self.current_word.clear();
    }

    pub fn force_clear(&mut self) {
        self.current_word.clear();
    }

    pub fn get_current_word(&self) -> &str {
        &self.current_word
    }

    pub fn get_context(&self) -> String {
        self.context.join(" ")
    }

    pub fn len(&self) -> usize {
        self.current_word.len()
    }

    pub fn is_empty(&self) -> bool {
        self.current_word.is_empty()
    }

    pub fn clear_context(&mut self) {
        self.context.clear();
    }
}

impl Default for Buffer {
    fn default() -> Self {
        Self::new()
    }
}
