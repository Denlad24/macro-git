import { events } from "@forge/bridge";

events.on("PROPS", ({ html }) => {
  // Create a fragment, allowing any embedded content scripts to be executed when appended
  const documentFragment = document
    .createRange()
    .createContextualFragment(html);
  document.body.innerHTML = "";
  document.body.appendChild(documentFragment);
});
