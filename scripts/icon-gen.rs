// Alternative Rust-based icon generator
// Run with: cargo run --example icon-gen (place in examples/)

use std::process::Command;

fn main() {
    println!("🎨 AiBangla Icon Generator");
    println!("==========================\n");

    // Check for resvg (SVG renderer)
    let has_resvg = Command::new("resvg")
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    if has_resvg {
        println!("✅ Using resvg for high-quality SVG rendering");

        let sizes = [(32, "32x32.png"), (128, "128x128.png"), (256, "128x128@2x.png"), (512, "icon.png")];

        for (size, filename) in &sizes {
            let output = format!("src-tauri/icons/{}", filename);
            let status = Command::new("resvg")
                .args(&["-w", &size.to_string(), "-h", &size.to_string()])
                .arg("src-tauri/icons/icon.svg")
                .arg(&output)
                .status();

            match status {
                Ok(s) if s.success() => println!("✅ Generated {}", filename),
                _ => println!("❌ Failed to generate {}", filename),
            }
        }
    } else {
        println!("ℹ️  resvg not found. Install with:");
        println!("   cargo install resvg");
        println!("\nOr use the Node.js script:");
        println!("   node scripts/generate-icons.js");
    }
}
