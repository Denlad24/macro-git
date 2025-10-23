import React, { useEffect, useState } from "react";
import { useSubmit } from "../../../common/useSubmit";
import { view, requestConfluence } from "@forge/bridge";

const CustomUIConfig = () => {
    const { error, message, submit } = useSubmit();

    // Configuration state
    const [linkType, setLinkType] = useState('out');
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [spaces, setSpaces] = useState([]);
    const [isWhitelist, setIsWhitelist] = useState(false);
    const [spaceInput, setSpaceInput] = useState('');

    // Preview state
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    let linksList;

    // Load existing configuration
    useEffect(() => {
        async function loadConfig() {
            try {
                const context = await view.getContext();
                const config = context.extension.config || {};

                setLinkType(config.linkType || 'out');
                setRowsPerPage(config.rowsPerPage || '10');
                setSpaces(config.spaces || []);
                setIsWhitelist(config.isWhitelist || false);
            } catch (err) {
                console.error('Error loading config:', err);
            }
        }
        loadConfig();
    }, []);

    // Load links for preview
    useEffect(() => {
        async function loadLinks() {
            setLoading(true);
            try {
                const context = await view.getContext();
                let response;
                let data;

                if (linkType === 'in') {
                    response = await requestConfluence(
                        `/wiki/rest/api/relation/link/to/content/${context.extension.content.id}/from/content?expand=source`,
                        { headers: { Accept: "application/json" } }
                    );
                    data = await response.json();
                    const titles = data.results.map(item => item.source.title);
                    const webuiLinks = data.results.map(item => item.source._links.webui);
                    const baseLink = data._links.base;

                    linksList = data.results.map((item, index) => ({
                        title: titles[index],
                        url: baseLink + webuiLinks[index]
                    }));

                } else {
                    response = await requestConfluence(
                        `/wiki/rest/api/relation/link/from/content/${context.extension.content.id}/to/content?expand=target`,
                        { headers: { Accept: "application/json" } }
                    );
                    data = await response.json();
                    const titles = data.results.map(item => item.target.title);
                    const webuiLinks = data.results.map(item => item.target._links.webui);
                    const baseLink = data._links.base;

                    linksList = data.results.map((item, index) => ({
                        title: titles[index],
                        url: baseLink + webuiLinks[index]
                    }));
                }

                if (spaces?.length) {
                    // Helper function to normalize space values (uppercase + trim)
                    const normalizeSpace = (value) => value?.toUpperCase().trim();

                    // Normalize all spaces in the list for case-insensitive comparison
                    const normalizedSpaces = spaces.map(normalizeSpace);

                    linksList = linksList.filter(link => {
                        // Extract the space identifier from the URL
                        const match = link.url.match(/\/spaces\/([^/]+)/);
                        const spaceValue = match?.[1].toUpperCase();

                        // Determine if the link belongs to one of the listed spaces
                        const isInList = spaceValue ? normalizedSpaces.includes(spaceValue) : false;
                        if (isWhitelist) {
                            // In whitelist mode → keep only matching links
                            return isInList;
                        } else {
                            // In blacklist mode → remove matching links, keep the rest
                            return !isInList;
                        }
                    });
                }

                setLinks(linksList)
                setLoading(false);
                setCurrentPage(1); // Reset to first page
            } catch (err) {
                console.error('Error loading links:', err);
                setLoading(false);
            }
        }

        loadLinks();
    }, [linkType, spaces, isWhitelist]);

    const addSpace = () => {
        const spaceKey = spaceInput.trim().toUpperCase();
        if (spaceKey && !spaces.includes(spaceKey)) {
            setSpaces([...spaces, spaceKey]);
            setSpaceInput('');
        }
    };

    const removeSpace = (spaceKey) => {
        setSpaces(spaces.filter(s => s !== spaceKey));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSpace();
        }
    };

    const handleSave = () => {
        const config = {
            linkType,
            rowsPerPage,
            spaces,
            isWhitelist
        };
        submit(config);
    };

    // Preview pagination
    const rowsPerPageNum = parseInt(rowsPerPage) || 10;
    const totalPages = Math.ceil(links.length / rowsPerPageNum);
    const startIndex = (currentPage - 1) * rowsPerPageNum;
    const endIndex = startIndex + rowsPerPageNum;
    const currentLinks = links.slice(startIndex, endIndex);

    return (
        <div style={styles.wrapper}>
            {/* Left side - Configuration */}
            <div style={styles.configPanel}>
                <h1 style={styles.title}>Configure Links Macro</h1>

                {/* Link Type */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Link Type</label>
                    <select
                        style={styles.select}
                        value={linkType}
                        onChange={(e) => setLinkType(e.target.value)}
                    >
                        <option value="in">Incoming Links</option>
                        <option value="out">Outgoing Links</option>
                    </select>
                    <div style={styles.description}>
                        Choose whether to display incoming or outgoing links
                    </div>
                </div>

                {/* Rows Per Page */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Rows Per Page</label>
                    <input
                        type="number"
                        style={styles.input}
                        min="1"
                        max="100"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(e.target.value)}
                    />
                    <div style={styles.description}>
                        Number of links to display per page in the table
                    </div>
                </div>

                {/* Space Filter Toggle */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Space Filter Mode</label>
                    <div style={styles.toggleContainer}>
                        <div style={styles.toggleLabel}>
                            <span style={styles.toggleTitle}>
                                {isWhitelist ? 'Whitelist Mode' : 'Blacklist Mode'}
                            </span>
                            <span style={styles.toggleDescription}>
                                {isWhitelist
                                    ? 'Only show links from specified spaces'
                                    : 'Exclude links from specified spaces'}
                            </span>
                        </div>
                        <div
                            style={{
                                ...styles.toggleSwitch,
                                backgroundColor: isWhitelist ? '#0052cc' : '#dfe1e6'
                            }}
                            onClick={() => setIsWhitelist(!isWhitelist)}
                        >
                            <div
                                style={{
                                    ...styles.toggleSlider,
                                    transform: isWhitelist ? 'translateX(24px)' : 'translateX(2px)'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Space Filter */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Space Keys</label>
                    <div style={styles.tagsContainer}>
                        <div style={styles.tagsList}>
                            {spaces.map((space, index) => (
                                <div key={index} style={styles.tag}>
                                    {space}
                                    <button
                                        style={styles.tagRemove}
                                        onClick={() => removeSpace(space)}
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            style={styles.tagInput}
                            value={spaceInput}
                            onChange={(e) => setSpaceInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type space key and press Enter"
                        />
                    </div>
                    <div style={styles.helperText}>
                        <span style={styles.icon}>ℹ️</span>
                        <span>Press Enter to add a space key (e.g., MYSPACE, DOCS)</span>
                    </div>
                </div>

                {/* Error message */}
                {typeof error !== 'undefined' && (
                    <div style={styles.errorMessage}>{message}</div>
                )}

                {/* Buttons */}
                <div style={styles.buttonGroup}>
                    <button
                        style={styles.btnCancel}
                        onClick={() => view.close()}
                    >
                        Cancel
                    </button>
                    <button
                        style={styles.btnSave}
                        onClick={handleSave}
                    >
                        Save Configuration
                    </button>
                </div>
            </div>

            {/* Right side - Live Preview */}
            <div style={styles.previewPanel}>
                <h2 style={styles.previewTitle}>Preview</h2>
                <div style={styles.previewContainer}>
                    {loading ? (
                        <div style={styles.previewLoading}>Loading preview...</div>
                    ) : (
                        <>
                            <h3 style={styles.caption}>
                                {linkType === 'in' ? 'Incoming links' : 'Outgoing links'}
                            </h3>

                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    <th style={styles.th}>Link name</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentLinks.map((link, index) => (
                                    <tr key={index} style={styles.tr}>
                                        <td style={styles.td}>
                                            <span style={styles.linkIcon}>📄</span>
                                            <a href={link.url} style={styles.link} target="_blank" rel="noopener noreferrer">
                                                {link.title}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <div style={styles.pagination}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            ...styles.paginationButton,
                                            opacity: currentPage === 1 ? 0.5 : 1,
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <span style={styles.pageInfo}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            ...styles.paginationButton,
                                            opacity: currentPage === totalPages ? 0.5 : 1,
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                            {links.length === 0 && (
                                <div style={styles.empty}>No links to display</div>
                            )}

                            <div style={styles.previewNote}>
                                <strong>Total:</strong> {links.length} link{links.length !== 1 ? 's' : ''}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Styles
const styles = {
    wrapper: {
        display: 'flex',
        gap: '24px',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        backgroundColor: '#f4f5f7',
        minHeight: '100vh'
    },
    configPanel: {
        flex: '0 0 400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        padding: '32px',
        height: 'fit-content'
    },
    previewPanel: {
        flex: '1',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        padding: '32px',
        height: 'fit-content'
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#172b4d',
        marginBottom: '24px'
    },
    previewTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#172b4d',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '2px solid #0052cc'
    },
    previewContainer: {
        minHeight: '300px'
    },
    previewLoading: {
        textAlign: 'center',
        padding: '48px',
        color: '#6b778c',
        fontSize: '14px'
    },
    previewNote: {
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f4f5f7',
        borderRadius: '4px',
        fontSize: '13px',
        color: '#42526e'
    },
    formGroup: {
        marginBottom: '24px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#172b4d',
        marginBottom: '8px'
    },
    description: {
        fontSize: '12px',
        color: '#6b778c',
        marginTop: '4px'
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        border: '2px solid #dfe1e6',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#172b4d',
        outline: 'none',
        cursor: 'pointer'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: '2px solid #dfe1e6',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#172b4d',
        outline: 'none'
    },
    toggleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: '#f4f5f7',
        borderRadius: '4px'
    },
    toggleLabel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    toggleTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#172b4d'
    },
    toggleDescription: {
        fontSize: '12px',
        color: '#6b778c'
    },
    toggleSwitch: {
        position: 'relative',
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    toggleSlider: {
        position: 'absolute',
        top: '2px',
        width: '20px',
        height: '20px',
        background: 'white',
        borderRadius: '50%',
        transition: 'transform 0.3s',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },
    tagsContainer: {
        border: '2px solid #dfe1e6',
        borderRadius: '4px',
        padding: '8px',
        minHeight: '80px'
    },
    tagsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '8px'
    },
    tag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: '#deebff',
        color: '#0052cc',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: '500'
    },
    tagRemove: {
        background: 'none',
        border: 'none',
        color: '#0052cc',
        cursor: 'pointer',
        fontSize: '16px',
        lineHeight: '1',
        padding: '0',
        width: '16px',
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%'
    },
    tagInput: {
        border: 'none',
        outline: 'none',
        width: '100%',
        padding: '4px',
        fontSize: '14px'
    },
    helperText: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '6px',
        fontSize: '12px',
        color: '#6b778c'
    },
    icon: {
        fontSize: '14px'
    },
    errorMessage: {
        padding: '12px',
        backgroundColor: '#ffebe6',
        color: '#bf2600',
        borderRadius: '4px',
        fontSize: '14px',
        marginBottom: '16px'
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #dfe1e6'
    },
    btnCancel: {
        padding: '10px 24px',
        border: '2px solid #dfe1e6',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        backgroundColor: 'white',
        color: '#42526e'
    },
    btnSave: {
        padding: '10px 24px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        backgroundColor: '#0052cc',
        color: 'white'
    },
    caption: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#172b4d',
        marginBottom: '12px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #dfe1e6'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        backgroundColor: '#f4f5f7',
        borderBottom: '2px solid #dfe1e6',
        fontWeight: '600',
        color: '#172b4d',
        fontSize: '14px'
    },
    tr: {
        borderBottom: '1px solid #dfe1e6'
    },
    td: {
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    linkIcon: {
        fontSize: '16px'
    },
    link: {
        color: '#0052cc',
        textDecoration: 'none',
        fontSize: '14px'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '16px',
        padding: '12px'
    },
    paginationButton: {
        padding: '8px 16px',
        border: '1px solid #dfe1e6',
        borderRadius: '4px',
        backgroundColor: 'white',
        fontSize: '14px'
    },
    pageInfo: {
        fontSize: '14px',
        color: '#42526e'
    },
    empty: {
        textAlign: 'center',
        padding: '48px',
        color: '#6b778c',
        fontStyle: 'italic',
        fontSize: '14px'
    }
};

export default CustomUIConfig;