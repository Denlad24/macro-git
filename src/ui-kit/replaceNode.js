// Simple replacement function that replaces unsupported content.
export const replaceUnsupportedNode = (node) => {
    return {
        type: 'paragraph',
        content: [{
            type: 'text',
            text: `Unsupported content: ${node.type}`
        }]
    }
}