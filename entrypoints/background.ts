export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === "switch-tab") {
      await browser.tabs.update(message.tabId, {
        active: true,
      });
    }
  });
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== "toggle-craycast") return;

    console.log(command, "pressed");

    let tabs = await browser.tabs.query({});

    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("TAB", tab);

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
