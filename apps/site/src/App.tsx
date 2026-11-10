import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import readme from "../../../README.md?raw";
import aiGuide from "../../../AI_GUIDE.md?raw";
import architecture from "../../../ARCHITECTURE.md?raw";
import rules from "../../../RULES.md?raw";
import agents from "../../../AGENTS.md?raw";
import cli from "../../../docs/CLI.md?raw";
import studio from "../../../docs/STUDIO.md?raw";
import core from "../../../docs/CORE.md?raw";

const DOCS = [
  { id: "readme", title: "Overview", content: readme },
  { id: "cli", title: "CLI", content: cli },
  { id: "studio", title: "Studio", content: studio },
  { id: "core", title: "Core", content: core },
  { id: "architecture", title: "Architecture", content: architecture },
  { id: "ai-guide", title: "AI guide", content: aiGuide },
  { id: "rules", title: "Rules", content: rules },
  { id: "agents", title: "Agents", content: agents },
];

export function App() {
  const [active, setActive] = useState("readme");
  const doc = DOCS.find((item) => item.id === active) ?? DOCS[0]!;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">b</span>
          <span>boardry</span>
        </div>
        <nav>
          {DOCS.map((item) => (
            <button
              key={item.id}
              className={item.id === active ? "nav active" : "nav"}
              onClick={() => setActive(item.id)}
            >
              {item.title}
            </button>
          ))}
        </nav>
        <div className="foot">The document centre for your product.</div>
      </aside>
      <main className="content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
      </main>
    </div>
  );
}
