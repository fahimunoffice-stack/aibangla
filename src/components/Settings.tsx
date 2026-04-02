import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Config } from "../App";

interface SettingsProps {
  config: Config;
  onSave: (config: Config) => void;
  onToggle: () => void;
  isActive: boolean;
}

const Settings: React.FC<SettingsProps> = ({ config, onSave, onToggle, isActive }) => {
  const [formData, setFormData] = useState<Config>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const models = [
    { value: "gpt-oss-120b", label: "GPT-OSS 120B (Default)" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast, Free Tier)" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7b (32K context)" },
    { value: "gemma2-9b-it", label: "Gemma 2 9B (Google)" },
  ];

  const modes = [
    { value: "bengali_correction", label: "Bengali Correction Only" },
    { value: "translation", label: "Translation Only" },
    { value: "both", label: "Bengali + Translation" },
    { value: "disabled", label: "Disabled" },
  ];

  const handleChange = (field: keyof Config, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTestApi = async () => {
    if (!formData.groq_api_key) {
      setTestResult(false);
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await invoke<boolean>("test_api_key", { key: formData.groq_api_key });
      setTestResult(result);
    } catch (error) {
      console.error("API test failed:", error);
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  };

  const handleModeChange = async (mode: string) => {
    setFormData((prev) => ({ ...prev, mode }));
    await invoke("set_mode", { mode });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>API Configuration</h2>

          <div style={styles.field}>
            <label style={styles.label}>Groq API Key</label>
            <div style={styles.inputGroup}>
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.groq_api_key}
                onChange={(e) => handleChange("groq_api_key", e.target.value)}
                placeholder="gsk_..."
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={styles.toggleBtn}
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
            </div>
            <p style={styles.hint}>
              Get your free API key at{" "}
              <a href="https://console.groq.com" style={styles.link}>
                console.groq.com
              </a>
            </p>
          </div>

          <div style={styles.field}>
            <button
              type="button"
              onClick={handleTestApi}
              disabled={testing || !formData.groq_api_key}
              style={styles.testBtn}
            >
              {testing ? "Testing..." : "Test API Key"}
            </button>
            {testResult !== null && (
              <span
                style={{
                  ...styles.testResult,
                  color: testResult ? "#4caf50" : "#f44336",
                }}
              >
                {testResult ? "✓ Valid" : "✗ Invalid"}
              </span>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>AI Model Settings</h2>

          <div style={styles.field}>
            <label style={styles.label}>Model</label>
            <select
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              style={styles.select}
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Input Mode</h2>

          <div style={styles.field}>
            <label style={styles.label}>Mode</label>
            <select
              value={formData.mode}
              onChange={(e) => handleModeChange(e.target.value)}
              style={styles.select}
            >
              {modes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {formData.mode === "translation" && (
            <div style={styles.field}>
              <label style={styles.label}>Target Language</label>
              <input
                type="text"
                value={formData.target_language}
                onChange={(e) => handleChange("target_language", e.target.value)}
                placeholder="e.g., Bengali, Hindi, Spanish"
                style={styles.input}
              />
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Preferences</h2>

          <div style={styles.field}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.trigger_on_space}
                onChange={(e) => handleChange("trigger_on_space", e.target.checked)}
                style={styles.checkbox}
              />
              Trigger correction on Space key
            </label>
          </div>

          <div style={styles.field}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.show_preview}
                onChange={(e) => handleChange("show_preview", e.target.checked)}
                style={styles.checkbox}
              />
              Show live preview
            </label>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Toggle Hotkey</label>
            <input
              type="text"
              value={formData.hotkey_toggle}
              disabled
              style={{ ...styles.input, opacity: 0.5 }}
            />
            <p style={styles.hint}>Hotkey toggle (Ctrl+Shift+B) coming soon</p>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.saveBtn}>
            Save Settings
          </button>
          <button
            type="button"
            onClick={onToggle}
            style={{
              ...styles.toggleBtn,
              backgroundColor: isActive ? "#f44336" : "#4caf50",
            }}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  section: {
    backgroundColor: "#16213e",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    color: "#4caf50",
  },
  field: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #0f3460",
    borderRadius: "8px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  inputGroup: {
    display: "flex",
    gap: "10px",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #0f3460",
    borderRadius: "8px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "14px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  hint: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    color: "#666",
  },
  link: {
    color: "#4caf50",
    textDecoration: "none",
  },
  testBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2196f3",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    transition: "opacity 0.2s",
  },
  testResult: {
    marginLeft: "10px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  actions: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
  },
  saveBtn: {
    flex: 1,
    padding: "15px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#4caf50",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
  toggleBtn: {
    flex: 1,
    padding: "15px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
};

export default Settings;
