import React, { useEffect, useState } from "react";
import { requestConfluence, view } from "@forge/bridge";

export function CustomUIApp() {
    const [config, setConfig] = useState({});
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    let linksList;
    useEffect(() => {
        async function loadConfigAndData() {
            try {
                const context = await view.getContext();
                const cfg = context.extension.config || {};
                setConfig(cfg);

                // Fetch links
                const linkType = cfg.linkType || 'out';
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

                if (cfg.spaces?.length) {
                    // Helper function to normalize space values (uppercase + trim)
                    const normalizeSpace = (value) => value?.toUpperCase().trim();

                    // Normalize all spaces in the list for case-insensitive comparison
                    const normalizedSpaces = cfg.spaces.map(normalizeSpace);

                    linksList = linksList.filter(link => {
                        // Extract the space identifier from the URL
                        const match = link.url.match(/\/spaces\/([^/]+)/);
                        const spaceValue = match?.[1].toUpperCase();

                        // Determine if the link belongs to one of the listed spaces
                        const isInList = spaceValue ? normalizedSpaces.includes(spaceValue) : false;
                        if (cfg.isWhitelist) {
                            // In whitelist mode → keep only matching links
                            return isInList;
                        } else {
                            // In blacklist mode → remove matching links, keep the rest
                            return !isInList;
                        }
                    });
                }

                setLinks(linksList)

                setLinks(linksList)
                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setLoading(false);
            }
        }

        loadConfigAndData();
    }, []);

    if (loading) {
        return <div style={styles.loading}>Loading links...</div>;
    }

    const rowsPerPage = parseInt(config.rowsPerPage) || 10;
    const totalPages = Math.ceil(links.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentLinks = links.slice(startIndex, endIndex);

    return (
        <div style={styles.container}>
            <h3 style={styles.caption}>
                {config.linkType === 'in' ? 'Incoming links' : 'Outgoing links'}
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
                            <span style={styles.icon}>📄</span>
                            <a href={link.url} style={styles.link}>
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
                        style={styles.paginationButton}
                    >
                        Previous
                    </button>
                    <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={styles.paginationButton}
                    >
                        Next
                    </button>
                </div>
            )}

            {links.length === 0 && (
                <div style={styles.empty}>No links to display</div>
            )}
        </div>
    );
}

const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '16px'
    },
    loading: {
        textAlign: 'center',
        padding: '32px',
        color: '#6b778c'
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
        color: '#172b4d'
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
    icon: {
        fontSize: '16px'
    },
    link: {
        color: '#0052cc',
        textDecoration: 'none'
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
        cursor: 'pointer',
        fontSize: '14px'
    },
    pageInfo: {
        fontSize: '14px',
        color: '#42526e'
    },
    empty: {
        textAlign: 'center',
        padding: '32px',
        color: '#6b778c',
        fontStyle: 'italic'
    }
};

export default CustomUIApp;