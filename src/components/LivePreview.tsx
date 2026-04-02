import React from "react";
import type { AppStatus } from "../App";

interface LivePreviewProps {
  status: AppStatus | null;
}

const LivePreview: React.FC<LivePreviewProps> = ({ status }) => {
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "BengaliCorrection":
        return "Bengali Phonetic Correction";
      case "Translation":
        return "Translation";
      case "Both":
        return "Bengali + Translation";
      case "Disabled":
        return "Disabled";
      default:
        return mode;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Live Preview</h2>

      <div style={styles.statusCard}>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Status</span>
          <span
            style={{
              ...styles.statusValue,
              color: status?.is_active ? "#4caf50" : "#f44336",
            }}
          >
            {status?.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Mode</span>
          <span style={styles.statusValue}>
            {status ? getModeLabel(status.mode) : "Loading..."}
          </span>
        </div>

        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>API Key</span>
          <span
            style={{
              ...styles.statusValue,
              color: status?.has_api_key ? "#4caf50" : "#f44336",
            }}
          >
            {status?.has_api_key ? "Configured" : "Not Configured"}
          </span>
        </div>
      </div>

      <div style={styles.previewCard}>
        <h3 style={styles.previewTitle}>Last Correction</h3>
        {status?.last_correction ? (
          <div style={styles.correctionBox}>
            <div style={styles.correctionText}>{status.last_correction}</div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📝</span>
            <p>No corrections yet. Start typing to see AI-powered corrections.</p>
          </div>
        )}
      </div>

      <div style={styles.instructionsCard}>
        <h3 style={styles.previewTitle}>How to Use</h3>
        <ol style={styles.instructions}>
          <li>Make sure AiBangla is <strong>Active</strong> (green indicator)</li>
          <li>Type any word in phonetic English (e.g., "ami", "bhalobasa")</li>
          <li>Press <strong>Space</strong> to trigger correction</li>
          <li>The word will be automatically replaced with Bengali text</li>
        </ol>

        <div style={styles.examples}>
          <h4 style={styles.examplesTitle}>Examples</h4>
          <div style={styles.exampleRow}>
            <span style={styles.exampleInput}>ami</span>
            <span style={styles.exampleArrow}>→</span>
            <span style={styles.exampleOutput}>আমি</span>
          </div>
          <div style={styles.exampleRow}>
            <span style={styles.exampleInput}>bhalobasa</span>
            <span style={styles.exampleArrow}>→</span>
            <span style={styles.exampleOutput}>ভালোবাসা</span>
          </div>
          <div style={styles.exampleRow}>
            <span style={styles.exampleInput}>bangladesh</span>
            <span style={styles.exampleArrow}>→</span>
            <span style={styles.exampleOutput}>বাংলাদেশ</span>
          </div>
        </div>
      </div>

      <div style={styles.tipsCard}>
        <h3 style={styles.previewTitle}>Tips</h3>
        <ul style={styles.tips}>
          <li>Use <strong>Backspace</strong> to correct typos before triggering</li>
          <li>Press <strong>Escape</strong> to clear the buffer</li>
          <li>Punctuation marks clear the current word buffer</li>
          <li>Toggle the app on/off using the system tray menu</li>
        </ul>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#4caf50",
  },
  statusCard: {
    backgroundColor: "#16213e",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #0f3460",
  },
  statusLabel: {
    color: "#aaa",
    fontSize: "14px",
  },
  statusValue: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  previewCard: {
    backgroundColor: "#16213e",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  previewTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    color: "#4caf50",
  },
  correctionBox: {
    backgroundColor: "#1a1a2e",
    border: "1px solid #0f3460",
    borderRadius: "8px",
    padding: "15px",
    textAlign: "center",
  },
  correctionText: {
    fontSize: "24px",
    color: "#fff",
  },
  emptyState: {
    textAlign: "center",
    padding: "30px",
    color: "#666",
  },
  emptyIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "10px",
  },
  instructionsCard: {
    backgroundColor: "#16213e",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  instructions: {
    paddingLeft: "20px",
    lineHeight: "1.8",
    color: "#ccc",
  },
  examples: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#1a1a2e",
    borderRadius: "8px",
  },
  examplesTitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    color: "#aaa",
  },
  exampleRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "8px 0",
    borderBottom: "1px solid #0f3460",
  },
  exampleInput: {
    flex: 1,
    fontFamily: "monospace",
    color: "#81c784",
  },
  exampleArrow: {
    color: "#666",
  },
  exampleOutput: {
    flex: 1,
    fontSize: "18px",
    color: "#4caf50",
  },
  tipsCard: {
    backgroundColor: "#16213e",
    borderRadius: "12px",
    padding: "20px",
  },
  tips: {
    paddingLeft: "20px",
    lineHeight: "1.8",
    color: "#ccc",
  },
};

export default LivePreview;
