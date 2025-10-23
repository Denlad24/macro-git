import CustomUIApp from "../../../custom-ui/src/app";
import React, { useEffect, useState } from "react";
import { useSubmit } from "../../../common/useSubmit";
import { view } from "@forge/bridge";

const CustomUIConfig = () => {
    const { error, message, submit } = useSubmit();

    // Configuration state
    const [linkType, setLinkType] = useState('out');
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [spaces, setSpaces] = useState([]);
    const [isWhitelist, setIsWhitelist] = useState(false);
    const [spaceInput, setSpaceInput] = useState('');

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

    // Add space to list
    const addSpace = () => {
        const spaceKey = spaceInput.trim().toUpperCase();
        if (spaceKey && !spaces.includes(spaceKey)) {
            setSpaces([...spaces, spaceKey]);
            setSpaceInput('');
        }
    };

    // Remove space from list
    const removeSpace = (spaceKey) => {
        setSpaces(spaces.filter(s => s !== spaceKey));
    };

    // Handle Enter key in space input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSpace();
        }
    };

    // Handle save
    const handleSave = () => {
        const config = {
            linkType,
            rowsPerPage,
            spaces,
            isWhitelist
        };
        submit(config);
    };

    return (
        <>
        <div style={styles.container}>
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
    <CustomUIApp />
    </>
    );
};

// Styles
const styles = {
    container: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '32px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#172b4d',
        marginBottom: '24px'
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
        minHeight: '100px'
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
    }
};

export default CustomUIConfig;
