use rdev::{EventType, Key};
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone)]
pub enum InputEvent {
    KeyPress(char),
    Backspace,
    Space,
    Enter,
    Punctuation(char),
    Tab,
    Escape,
    Other,
}

pub struct InputHook {
    sender: Sender<InputEvent>,
    running: Arc<Mutex<bool>>,
}

impl InputHook {
    pub fn new() -> (Self, std::sync::mpsc::Receiver<InputEvent>) {
        let (sender, receiver) = channel();
        let running = Arc::new(Mutex::new(false));

        let hook = InputHook {
            sender,
            running,
        };

        (hook, receiver)
    }

    pub fn start(&self) {
        let sender = self.sender.clone();
        let running = self.running.clone();

        *running.lock().unwrap() = true;

        std::thread::spawn(move || {
            let callback = move |event: rdev::Event| {
                let input_event = match event.event_type {
                    EventType::KeyPress(key) => {
                        match key {
                            Key::Backspace => InputEvent::Backspace,
                            Key::Space => InputEvent::Space,
                            Key::Return => InputEvent::Enter,
                            Key::Tab => InputEvent::Tab,
                            Key::Escape => InputEvent::Escape,
                            Key::KeyA => InputEvent::KeyPress('a'),
                            Key::KeyB => InputEvent::KeyPress('b'),
                            Key::KeyC => InputEvent::KeyPress('c'),
                            Key::KeyD => InputEvent::KeyPress('d'),
                            Key::KeyE => InputEvent::KeyPress('e'),
                            Key::KeyF => InputEvent::KeyPress('f'),
                            Key::KeyG => InputEvent::KeyPress('g'),
                            Key::KeyH => InputEvent::KeyPress('h'),
                            Key::KeyI => InputEvent::KeyPress('i'),
                            Key::KeyJ => InputEvent::KeyPress('j'),
                            Key::KeyK => InputEvent::KeyPress('k'),
                            Key::KeyL => InputEvent::KeyPress('l'),
                            Key::KeyM => InputEvent::KeyPress('m'),
                            Key::KeyN => InputEvent::KeyPress('n'),
                            Key::KeyO => InputEvent::KeyPress('o'),
                            Key::KeyP => InputEvent::KeyPress('p'),
                            Key::KeyQ => InputEvent::KeyPress('q'),
                            Key::KeyR => InputEvent::KeyPress('r'),
                            Key::KeyS => InputEvent::KeyPress('s'),
                            Key::KeyT => InputEvent::KeyPress('t'),
                            Key::KeyU => InputEvent::KeyPress('u'),
                            Key::KeyV => InputEvent::KeyPress('v'),
                            Key::KeyW => InputEvent::KeyPress('w'),
                            Key::KeyX => InputEvent::KeyPress('x'),
                            Key::KeyY => InputEvent::KeyPress('y'),
                            Key::KeyZ => InputEvent::KeyPress('z'),
                            Key::Minus => InputEvent::Punctuation('-'),
                            Key::Equal => InputEvent::Punctuation('='),
                            Key::LeftBracket => InputEvent::Punctuation('['),
                            Key::RightBracket => InputEvent::Punctuation(']'),
                            Key::BackSlash => InputEvent::Punctuation('\\'),
                            Key::SemiColon => InputEvent::Punctuation(';'),
                            Key::Quote => InputEvent::Punctuation('\''),
                            Key::Comma => InputEvent::Punctuation(','),
                            Key::Dot => InputEvent::Punctuation('.'),
                            Key::Slash => InputEvent::Punctuation('/'),
                            Key::BackQuote => InputEvent::Punctuation('`'),
                            Key::Num1 => InputEvent::KeyPress('1'),
                            Key::Num2 => InputEvent::KeyPress('2'),
                            Key::Num3 => InputEvent::KeyPress('3'),
                            Key::Num4 => InputEvent::KeyPress('4'),
                            Key::Num5 => InputEvent::KeyPress('5'),
                            Key::Num6 => InputEvent::KeyPress('6'),
                            Key::Num7 => InputEvent::KeyPress('7'),
                            Key::Num8 => InputEvent::KeyPress('8'),
                            Key::Num9 => InputEvent::KeyPress('9'),
                            Key::Num0 => InputEvent::KeyPress('0'),
                            _ => InputEvent::Other,
                        }
                    }
                    _ => InputEvent::Other,
                };

                let _ = sender.send(input_event);
            };

            if let Err(e) = rdev::listen(callback) {
                log::error!("Input hook error: {:?}", e);
            }
        });
    }

    pub fn stop(&self) {
        *self.running.lock().unwrap() = false;
    }

    pub fn is_running(&self) -> bool {
        *self.running.lock().unwrap()
    }
}

impl Default for InputHook {
    fn default() -> Self {
        let (sender, _) = channel();
        InputHook {
            sender,
            running: Arc::new(Mutex::new(false)),
        }
    }
}
