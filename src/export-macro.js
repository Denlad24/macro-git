import { doc, p } from "@atlaskit/adf-utils/builders";

export function adfExport(payload) {
  const macroBody = payload.extensionPayload.macro.body;

  return doc(
    p("This is my export function. Here's the macro content:"),
    ...macroBody.content
  );
}
