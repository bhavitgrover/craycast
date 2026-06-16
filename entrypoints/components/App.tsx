import { useEffect, useState } from "react";
import "@fontsource/outfit";
import "./App.css";
import TabLink from "./TabLink";
import Fuse from "fuse.js";

export default function App() {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const fuse = new Fuse(tabs, {
    keys: ["title", "url"],
    threshold: 0.4,
  });

  const filteredTabs = query
    ? fuse.search(query).map((result) => result.item)
    : tabs;

  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === "toggle") {
        setOpen((prev) => !prev);
        setTabs(message.tabs ?? []);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "Escape") {
        setOpen(false);
      }
    };

    browser.runtime.onMessage.addListener(listener);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="craycast-overlay">
      <div className="craycast-window">
        <div className="craycast-search">
          <input
            className="craycast-input"
            autoFocus
            placeholder="Search tabs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="craycast-results">
          {filteredTabs.map((tab) => (
            <TabLink key={tab.id ?? tab.url} tab={tab} />
          ))}
        </div>
      </div>
    </div>
  );
}
