import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Settings from "./components/Settings";
import LivePreview from "./components/LivePreview";
import SystemTray from "./components/SystemTray";

export interface Config {
  groq_api_key: string;
  model: string;
  mode: string;
  target_language: string;
  trigger_on_space: boolean;
  show_preview: boolean;
  hotkey_toggle: string;
}

export interface AppStatus {
  mode: string;
  is_active: boolean;
  last_correction: string | null;
  has_api_key: boolean;
}

const App: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"settings" | "preview">("settings");

  const loadConfig = async () => {
    try {
      const cfg = await invoke<Config>("get_config");
      setConfig(cfg);
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  };

  const loadStatus = async () => {
    try {
      const stat = await invoke<AppStatus>("get_status");
      setStatus(stat);
    } catch (error) {
      console.error("Failed to load status:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadConfig();
      await loadStatus();
      setLoading(false);
    };
    init();

    // Refresh status every 2 seconds
    const interval = setInterval(loadStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async (newConfig: Config) => {
    try {
      await invoke("save_config", { config: newConfig });
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  };

  const handleToggle = async () => {
    try {
      const newState = await invoke<boolean>("toggle_active");
      setStatus((prev) => (prev ? { ...prev, is_active: newState } : prev));
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading AiBangla...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>AiBangla</h1>
        <div style={styles.status}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: status?.is_active ? "#4caf50" : "#f44336",
            }}
          />
          <span>{status?.is_active ? "Active" : "Inactive"}</span>
        </div>
      </header>

      <nav style={styles.nav}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "settings" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "preview" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("preview")}
        >
          Live Preview
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === "settings" && config && (
          <Settings
            config={config}
            onSave={handleSaveConfig}
            onToggle={handleToggle}
            isActive={status?.is_active || false}
          />
        )}
        {activeTab === "preview" && <LivePreview status={status} />}
      </main>

      <SystemTray />

      {!status?.has_api_key && (
        <div style={styles.notification}>
          <strong>Welcome!</strong> Please add your Groq API key in Settings to get started.
          Get a free key at <a href="https://console.groq.com" style={styles.link}>console.groq.com</a>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1a1a2e",
    color: "#eee",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#1a1a2e",
    color: "#eee",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #333",
    borderTop: "4px solid #4caf50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    backgroundColor: "#16213e",
    borderBottom: "1px solid #0f3460",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    background: "linear-gradient(90deg, #4caf50, #81c784)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  nav: {
    display: "flex",
    backgroundColor: "#16213e",
    borderBottom: "1px solid #0f3460",
  },
  tab: {
    flex: 1,
    padding: "15px",
    backgroundColor: "transparent",
    border: "none",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s",
  },
  activeTab: {
    color: "#4caf50",
    borderBottom: "2px solid #4caf50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  main: {
    flex: 1,
    padding: "30px",
    overflow: "auto",
  },
  notification: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    padding: "15px 25px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    maxWidth: "80%",
    textAlign: "center",
  },
  link: {
    color: "#4caf50",
    textDecoration: "none",
  },
};

export default App;
