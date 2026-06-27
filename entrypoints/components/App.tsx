import { useEffect, useState, useRef } from "react";
import "./App.css";
import TabLink from "./TabLink";
import Fuse from "fuse.js";
import { storeApiKey } from "../../utils/storeApiKey";

export default function App() {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [showMenu, setShowMenu] = useState("filteredLinks");
  const resultsRef = useRef<HTMLDivElement>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] =
    useState("Type to search...");
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyStored, setApiKeyStored] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const links = [...tabs, ...bookmarks];

  const fuse = new Fuse(links, {
    keys: ["title", "url"],
    threshold: 0.4,
  });

  useEffect(() => {
    const loadApiKey = async () => {
      const value = await storeApiKey.getValue();
      if (value) {
        setApiKeyStored(true);
        setApiKey(value);
      }
    };
    loadApiKey();
  }, []);

  const saveApiKey = async (key: string) => {
    const trimmedKey = key.trim();
    await storeApiKey.setValue(trimmedKey);
    setApiKeyStored(true);
  };

  const removeApiKey = async () => {
    await storeApiKey.removeValue();
    setApiKeyStored(false);
    setApiKey("");
  };

  const filteredLinks = query
    ? fuse.search(query).map((result) => result.item)
    : links;

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
    const loadBookmarks = async () => {
      const bookmarksImported = await browser.runtime.sendMessage({
        action: "get-bookmarks",
      });

      const bkmrks = bookmarksImported?.bookmarks[0].children[0].children ?? [];

      const trimmedBookmarks = bkmrks.map((bookmark: any) => ({
        title:
          bookmark.title?.length > 30
            ? bookmark.title.substring(0, 30) + "..."
            : bookmark.title,
        url: bookmark.url,
        id: bookmark.id,
        type: "Bookmark",
      }));

      setBookmarks(trimmedBookmarks);
      console.log(links);
    };
    loadBookmarks();

    console.log("Tabs:", tabs);
    console.log("Bookmarks loaded:", bookmarks);
    console.log("Links:", links);
  }, []);

  useEffect(() => {
    const keyPress = async (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "Escape":
          setOpen(false);
          break;

        case "ArrowDown":
          event.preventDefault();

          if (filteredLinks.length === 0) return;

          setSelected((prev) => (prev + 1) % filteredLinks.length);
          console.log("arrow down pressed");
          break;

        case "ArrowUp":
          event.preventDefault();
          console.log("arrow up pressed");

          if (filteredLinks.length === 0) return;

          setSelected((prev) =>
            prev === 0 ? filteredLinks.length - 1 : prev - 1,
          );
          break;

        case "Tab":
          event.preventDefault();

          if (showMenu === "aiMode") {
            setShowMenu("filteredLinks");
            setSearchPlaceholder("Search... (tab to ask AI)");
          } else {
            setShowMenu("aiMode");
            setSearchPlaceholder("Ask AI... (tab to search)");
          }
          break;

        case "Enter":
          event.preventDefault();

          if (showMenu === "filteredLinks") {
            if (filteredLinks.length === 0) return;

            const selectedTab = filteredLinks[selected];

            if (selectedTab.type === "Tab") {
              browser.runtime.sendMessage({
                action: "switch-tab",
                tabId: selectedTab.id,
              });
            } else {
              browser.runtime.sendMessage({
                action: "open-bookmark",
                url: selectedTab.url,
              });
            }

            setOpen(false);
          } else if (showMenu === "aiMode" && apiKeyStored) {
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
  }, [open, filteredLinks, selected, showMenu, query]);

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

        const trimmedTabs = incomingTabs.map((tab) => ({
          title: tab.title,
          url: tab.url,
          id: tab.id,
          favIconUrl: tab.favIconUrl,
          type: "Tab",
        }));
        setTabs(trimmedTabs);
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
          {showMenu === "filteredLinks" &&
            filteredLinks.map((item, index) => {
              const previousItem = filteredLinks[index - 1];

              const showHeader =
                index === 0 || previousItem?.type !== item.type;

              return (
                <div key={item.id ?? item.url}>
                  {showHeader && (
                    <>
                      {index !== 0 && <div className="section-spacer" />}

                      <div className="section-header">
                        {item.type === "Tab" ? "Tabs" : "Bookmarks"}
                      </div>
                    </>
                  )}

                  <div
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                  >
                    <TabLink
                      key={item.id ?? item.url}
                      tab={item}
                      type={item.type}
                      selected={index === selected}
                    />
                  </div>
                </div>
              );
            })}

          {showMenu === "aiMode" && !apiKeyStored && (
            <div className="craycast-api-mode">
              <span className="api-text">
                Please enter your Hack Club API key (without Bearer):
              </span>
              <span className="api-text">
                For example, if your key is "Bearer abc123", enter "abc123"
                below. You can get your API key from{" "}
                <a
                  href="https://ai.hackclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hack Club AI
                </a>
              </span>

              <input
                className="api-input"
                placeholder="Enter Api Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button className="api-button" onClick={() => saveApiKey(apiKey)}>
                Submit
              </button>
            </div>
          )}

          {showMenu === "aiMode" && apiKeyStored && (
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
              <button className="remove-api" onClick={() => removeApiKey()}>
                Remove API Key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
