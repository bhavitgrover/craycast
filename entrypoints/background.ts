import { storeApiKey } from "../utils/storeApiKey";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      try {
        if (message.action === "get-bookmarks") {
          const bookmarks = await browser.bookmarks.getTree();
          sendResponse({
            bookmarks,
          });
        }

        if (message.action === "open-bookmark") {
          await browser.tabs.create({
            url: message.url,
          });
        }

        if (message.action === "switch-tab") {
          await browser.tabs.update(message.tabId, {
            active: true,
          });
          sendResponse({ success: true });
          return true;
        }
        if (message.action === "ask-ai") {
          try {
            const apiKey = await storeApiKey.getValue();
            if (!apiKey) {
              sendResponse({
                action: "ai-response",
                response: `No API key set`,
                error: true,
              });
            }

            const response = await fetch(
              "https://ai.hackclub.com/proxy/v1/responses",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: "anthropic/claude-opus-4.8",
                  input: [
                    {
                      type: "message",
                      role: "user",
                      content: [
                        {
                          type: "input_text",
                          text: message.query,
                        },
                      ],
                    },
                  ],
                  stream: false,
                  max_output_tokens: 9000,
                }),
              },
            );
            console.log("Response status:", response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`API Error ${response.status}:`, errorText);
              sendResponse({
                action: "ai-response",
                response: `API Error ${response.status}: ${errorText.substring(0, 200)}`,
                error: true,
              });
              return true;
            }

            const data = await response.json();
            console.log("API Response data:", data);
            const aiResp =
              data.output?.[0]?.content?.[0].text || JSON.stringify(data);
            sendResponse({
              action: "ai-response",
              response: aiResp,
            });
            return true;
          } catch (error) {
            console.error("Error in ask-ai:", error);
            sendResponse({
              action: "ai-response",
              response: `Error generating response: ${error instanceof Error ? error.message : String(error)}`,
              error: true,
            });
            return true;
          }
        }
      } catch (error) {
        console.error("Listener error:", error);
        sendResponse({
          action: "error",
          response: "Internal error",
          error: true,
        });
      }
      return true;
    },
  );
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== "toggle-craycast") return;

    console.log(command, "pressed");

    let tabs = await browser.tabs.query({});

    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    // console.log("TAB", tab);

    if (tab.id) {
      browser.tabs.sendMessage(
        tab.id,
        {
          action: "toggle",
          tabs: tabs,
        },
        () => {
          if (browser.runtime.lastError) {
            console.error(browser.runtime.lastError);
          } else {
            console.log("message sent");
          }
        },
      );
    }
  });
});
