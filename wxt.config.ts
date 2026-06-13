import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  manifest: {
    permissions: ["tabs"],

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
