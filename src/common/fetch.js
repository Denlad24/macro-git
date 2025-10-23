import { requestConfluence } from "@forge/bridge";

/**
 * @see https://developer.atlassian.com/cloud/confluence/rest/v1/api-group-content-body/#api-wiki-rest-api-contentbody-convert-async-to-post
 */
export async function convertMacroBody(to, macroBody, contentId) {
  const params = new URLSearchParams({
    contentIdContext: contentId,
    expand: "webresource.tags.all,webresource.superbatch.tags.all",
  }).toString();

  const response = await requestConfluence(
    `/wiki/rest/api/contentbody/convert/async/${to}?${params}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: JSON.stringify(macroBody),
        representation: "atlas_doc_format",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()).asyncId;
}

/**
 * @see https://developer.atlassian.com/cloud/confluence/rest/v1/api-group-content-body/#api-wiki-rest-api-contentbody-convert-async-id-get
 */
export async function fetchConvertedMacroBody(id) {
  const response = await requestConfluence(
    `/wiki/rest/api/contentbody/convert/async/${id}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  const { status, error, value, webresource } = await response.json();

  if (status === "FAILED") {
    throw new Error(`Conversion failed: ${error}`);
  } else if (status === "COMPLETED") {
    const scripts = webresource.superbatch.tags.all + webresource.tags.all;
    const html = value.replace("</head>", `${scripts}</head>`);
    return html;
  }

  return fetchConvertedMacroBody(id);
}
