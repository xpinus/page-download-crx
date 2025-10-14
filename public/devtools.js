chrome.devtools.panels.create(
  "PageDownloader",
  "48.png",
  "index.html",
  function (panel) {
    // code invoked on panel creation
    console.log(
      "page-download-crx panel creation:",
      new Date().toLocaleString(),
      panel,
    );
  },
);
