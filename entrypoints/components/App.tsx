import { useEffect, useState, useRef } from "react";
import "./App.css";
import TabLink from "./TabLink";
import Fuse from "fuse.js";

export default function App() {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [showMenu, setShowMenu] = useState("filteredTabs");
  const resultsRef = useRef<HTMLDivElement>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] =
    useState("Type to search...");
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fuse = new Fuse(tabs, {
    keys: ["title", "url"],
    threshold: 0.4,
  });

  const filteredTabs = query
    ? fuse.search(query).map((result) => result.item)
    : tabs;

  useEffect(() => {
    itemRefs.current[selected]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selected]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const keyPress = async (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "Escape":
          setOpen(false);
          break;

        case "ArrowDown":
          event.preventDefault();

          if (filteredTabs.length === 0) return;

          setSelected((prev) => (prev + 1) % filteredTabs.length);
          console.log("arrow down pressed");
          break;

        case "ArrowUp":
          event.preventDefault();
          console.log("arrow up pressed");

          if (filteredTabs.length === 0) return;

          setSelected((prev) =>
            prev === 0 ? filteredTabs.length - 1 : prev - 1,
          );
          break;

        case "Tab":
          event.preventDefault();

          if (showMenu === "aiMode") {
            setShowMenu("filteredTabs");
            setSearchPlaceholder("Search... (tab to ask AI)");
          } else {
            setShowMenu("aiMode");
            setSearchPlaceholder("Ask AI... (tab to search)");
          }
          break;

        case "Enter":
          event.preventDefault();

          if (showMenu === "filteredTabs") {
            if (filteredTabs.length === 0) return;

            const selectedTab = filteredTabs[selected];

            browser.runtime.sendMessage({
              action: "switch-tab",
              tabId: selectedTab.id,
            });

            setOpen(false);
          } else if (showMenu === "aiMode") {
            setAiResponse("Loading...");

            browser.runtime.sendMessage(
              {
                action: "ask-ai",
                query,
              },
              (response) => {
                if (browser.runtime.lastError) {
                  setAiResponse("Error: " + browser.runtime.lastError.message);
                } else {
                  setAiResponse(response?.response ?? "No response");
                }
              },
            );
          }

          break;
      }
    };

    window.addEventListener("keydown", keyPress, true);

    return () => {
      window.removeEventListener("keydown", keyPress, true);
    };
  }, [open, filteredTabs, selected, showMenu, query]);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === "toggle") {
        setOpen((prev) => !prev);

        const incomingTabs = [...(message.tabs ?? [])];

        for (let i = 0; i < incomingTabs.length; i++) {
          if (incomingTabs[i].title && incomingTabs[i].title.length > 30) {
            incomingTabs[i].title =
              incomingTabs[i].title.substring(0, 30) + "...";
          }
        }
        console.log("incoming tabs", incomingTabs);
        setTabs(incomingTabs);
      }

      if (message.action === "ai-response") {
        setAiResponse(message.response ?? "No response");
      }
    };

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  // console.log("Current tabs:", tabs);

  if (!open) return null;

  return (
    <div className="craycast-overlay">
      <div className="craycast-window">
        <div className="craycast-search">
          <input
            className="craycast-input"
            autoFocus
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div ref={resultsRef} className="craycast-results">
          {showMenu === "filteredTabs" &&
            filteredTabs.map((tab, index) => (
              <div
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                key={tab.id ?? tab.url}
              >
                <TabLink
                  key={tab.id ?? tab.url}
                  tab={tab}
                  type="Tab"
                  selected={index === selected}
                />
              </div>
            ))}

          {showMenu === "aiMode" && (
            <div className="craycast-ai-mode">
              {!aiResponse ? <p>Your responses will show up here.</p> : <p></p>}
              <div
                className={`craycast-human-query ${!aiResponse ? "hidden" : ""}`}
              >
                <span>{query}</span>
              </div>
              <div
                className={`craycast-ai-response ${!aiResponse ? "hidden" : ""}`}
              >
                <span>{aiResponse}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
