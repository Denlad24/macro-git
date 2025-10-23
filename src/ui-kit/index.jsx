import React, { Fragment, useEffect, useState } from 'react';
import ForgeReconciler, { Link, DynamicTable, Icon, useConfig } from '@forge/react';
import { requestConfluence, view } from '@forge/bridge';

export const head = {
    cells: [
        {
            key: "name",
            content: "Link name",
            isSortable: true,
        }
    ],
};

const App = () => {
    // Get configuration from Custom UI config
    const config = useConfig() || {};

    const [rows, setRows] = useState([]);
    const [cap, setCap] = useState('Links');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const createKey = (input) => {
        return input ? input.replace(/^(the|a|an)/, "").replace(/\s/g, "") : input;
    };

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            try {
                const context = await view.getContext();

                let response;
                let titles;
                let webuiLinks;
                let data;
                let caption;

                // Get link type from config (default: 'out')
                const linkType = config.linkType || 'out';

                if (linkType === 'in') {
                    // Fetch incoming links
                    response = await requestConfluence(
                        `/wiki/rest/api/relation/link/to/content/${context.extension.content.id}/from/content?expand=source`,
                        { headers: { Accept: "application/json" } }
                    );
                    data = await response.json();
                    titles = data.results.map(item => item.source.title);
                    webuiLinks = data.results.map(item => item.source._links.webui);
                    caption = "Incoming links";
                } else {
                    // Fetch outgoing links
                    response = await requestConfluence(
                        `/wiki/rest/api/relation/link/from/content/${context.extension.content.id}/to/content?expand=target`,
                        { headers: { Accept: "application/json" } }
                    );
                    data = await response.json();
                    titles = data.results.map(item => item.target.title);
                    webuiLinks = data.results.map(item => item.target._links.webui);
                    caption = "Outgoing links";
                }

                const baseLink = data._links.base;

                // Create links array
                const links = data.results.map((item, index) => ({
                    id: index + 1,
                    title: titles[index],
                    url: baseLink + webuiLinks[index]
                }));

                // Filter by spaces (blacklist or whitelist)
                let filteredLinks = links;
                if (config.spaces && config.spaces.length > 0) {
                    filteredLinks = links.filter(link => {
                        const match = link.url.match(/\/spaces\/([^/]+)/);
                        if (!match) return !config.isWhitelist; // No space found

                        const spaceValue = match[1];
                        const isInList = config.spaces.includes(spaceValue);

                        // Whitelist: keep only if in list
                        // Blacklist: keep only if NOT in list
                        return config.isWhitelist ? isInList : !isInList;
                    });
                }

                // Transform into table rows
                const rows_list = filteredLinks.map((link, index) => ({
                    key: `row-${index}-${link.title}`,
                    cells: [
                        {
                            key: createKey(link.title),
                            content: (
                                <Fragment>
                                    <Icon glyph={"page"} color={"color.text.accent.blue"} />
                                    <Link href={link.url}>{link.title}</Link>
                                </Fragment>
                            ),
                        }
                    ],
                }));

                setRows(rows_list);
                setCap(caption);
                setRowsPerPage(parseInt(config.rowsPerPage) || 10);
                setLoading(false);

            } catch (err) {
                console.error("Error while loading links info:", err);
                setRows([]);
                setLoading(false);
            }
        }

        loadData();
    }, [config]);

    if (loading) {
        return <Fragment>Loading links...</Fragment>;
    }

    return (
        <Fragment>
            <DynamicTable
                emptyView="No data to display"
                rowsPerPage={rowsPerPage}
                caption={cap}
                rows={rows}
                appearance="subtle"
            />
        </Fragment>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);