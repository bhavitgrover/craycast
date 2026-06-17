import { useEffect, useState } from "react";
import "@fontsource/outfit";
import "./App.css";
import TabLink from "./TabLink";
import Fuse from "fuse.js";

export default function App() {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const fuse = new Fuse(tabs, {
    keys: ["title", "url"],
    threshold: 0.4,
  });

  const filteredTabs = query
    ? fuse.search(query).map((result) => result.item)
    : tabs;

  useEffect(() => {
    const keyPress = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "Escape":
          setOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();

          if (filteredTabs.length === 0) return;
          setSelected((prev) => (prev + 1) % filteredTabs.length);
          break;
        case "ArrowUp":
          event.preventDefault();

          if (filteredTabs.length === 0) return;
          setSelected((prev) =>
            prev === 0 ? filteredTabs.length - 1 : prev - 1,
          );
          break;
        case "Enter":
          event.preventDefault();

          if (filteredTabs.length === 0) return;
          const selectedTab = filteredTabs[selected];
          browser.runtime.sendMessage({
            action: "switch-tab",
            tabId: selectedTab.id,
          });
          setOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", keyPress);

    return () => {
      window.removeEventListener("keydown", keyPress);
    };
  }, [filteredTabs, open, selected]);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === "toggle") {
        setOpen((prev) => !prev);
        setTabs(message.tabs ?? []);
      }
    };

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
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
          {filteredTabs.map((tab, index) => (
            <TabLink
              key={tab.id ?? tab.url}
              tab={tab}
              type="Tab"
              selected={index === selected}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
