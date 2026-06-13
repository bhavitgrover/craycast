import { useEffect, useState } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === "toggle") {
        setOpen((prev) => !prev);
        setTabs(message.tabs);
      }
    };

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 12010901901,
        display: "flex",
        justifyContent: "center",
        alignContent: "flex-start",
        paddingTop: "10vh",
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          width: "70vw",
          height: "fit-content",
          background: "#1a1a1a",
          color: "#fff",
          borderRadius: "10px",
          padding: "5vw",
        }}
      >
        <h1>Meow</h1>
        {tabs.map((tab: any, index: number) => (
          <p key={tab.url}>{tab.title}</p>
        ))}
      </div>
    </div>
  );
}
