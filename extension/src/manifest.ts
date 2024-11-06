import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  name: "supaguide",
  description: "",
  version: "0.0.0",
  manifest_version: 3,
  icons: {
    16: "img/logo-16.png",
    32: "img/logo-34.png",
    48: "img/logo-48.png",
    128: "img/logo-128.png",
  },
  action: {
    default_popup: "popup.html",
    default_icon: "img/logo-48.png",
  },
  options_page: "options.html",
  devtools_page: "devtools.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/contentScript/index.ts"],
    },
  ],
  side_panel: {
    default_path: "sidepanel.html",
  },
  web_accessible_resources: [
    {
      resources: ["img/logo-16.png", "img/logo-34.png", "img/logo-48.png", "img/logo-128.png"],
      matches: [],
    },
  ],
  permissions: [
    "sidePanel",
    "storage",
    "tabs",
    "activeTab",
    "desktopCapture",
    "pageCapture",
    "tabCapture",
    "scripting",
  ],
  chrome_url_overrides: {
    newtab: "newtab.html",
  },
  host_permissions: ["*://*/*"],
});
