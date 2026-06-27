import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  manifest: {
    web_accessible_resources: [
      {
        resources: ["fonts/*"],
        matches: ["<all_urls>"],
      },
    ],
    permissions: ["tabs", "storage", "bookmarks"],

    host_permissions: ["<all_urls>"],

    commands: {
      "toggle-craycast": {
        suggested_key: {
          default: "Ctrl+Shift+K",
        },
        description: "Toggle Craycast",
      },
    },
  },
});
