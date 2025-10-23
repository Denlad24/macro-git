import React, { useEffect, useState } from "react";
import ForgeReconciler, {
    Button,
    ButtonSet,
    Label,
    Select,
    TextField,
    Text,
    Stack,
    Box,
    Tag
} from "@forge/react";
import { view } from "@forge/bridge";
import { useSubmit } from "../common/useSubmit";

const UIKitCustomConfig = () => {
    const { error, message, submit } = useSubmit();

    // Configuration state
    const [linkType, setLinkType] = useState('out');
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [spaces, setSpaces] = useState([]);
    const [isWhitelist, setIsWhitelist] = useState(false);
    const [spaceInput, setSpaceInput] = useState('');

    useEffect(async () => {
        const context = await view.getContext();
        const config = context.extension.config || {};

        setLinkType(config.linkType || 'out');
        setRowsPerPage(config.rowsPerPage || '10');
        setSpaces(config.spaces || []);
        setIsWhitelist(config.isWhitelist || false);
    }, []);

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
            <Label labelFor="linkType">Link Type</Label>
            <Select
                name="linkType"
                value={linkType}
                onChange={(value) => setLinkType(value)}
            >
                <option value="in">Incoming Links</option>
                <option value="out">Outgoing Links</option>
            </Select>
            <Text>Choose whether to display incoming or outgoing links</Text>

            <Label labelFor="rowsPerPage">Rows Per Page</Label>
            <TextField
                name="rowsPerPage"
                type="number"
                value={rowsPerPage}
                onChange={(value) => setRowsPerPage(value)}
            />
            <Text>Number of links to display per page</Text>

            <Label labelFor="filterMode">Space Filter Mode</Label>
            <Select
                name="filterMode"
                value={isWhitelist ? 'whitelist' : 'blacklist'}
                onChange={(value) => setIsWhitelist(value === 'whitelist')}
            >
                <option value="blacklist">Blacklist (Exclude spaces)</option>
                <option value="whitelist">Whitelist (Only these spaces)</option>
            </Select>
            <Text>
                {isWhitelist
                    ? 'Only show links from specified spaces'
                    : 'Exclude links from specified spaces'}
            </Text>

            <Label labelFor="spaceInput">Space Keys</Label>
            <TextField
                name="spaceInput"
                value={spaceInput}
                onChange={(value) => setSpaceInput(value)}
                placeholder="Enter space key (e.g., MYSPACE)"
            />
            <Button text="Add Space" onClick={addSpace} />

            {spaces.length > 0 && (
                <>
                    <Text>Current spaces:</Text>
                    <Stack>
                        {spaces.map((space, index) => (
                            <Tag key={index} text={space} onRemove={() => removeSpace(space)} />
                        ))}
                    </Stack>
                </>
            )}

            {typeof error !== "undefined" && (
                <Text>
                    {error ? '❌' : '✅'} {message}
                </Text>
            )}

            <ButtonSet>
                <Button text="Save Configuration" appearance="primary" onClick={handleSave} />
                <Button text="Close" onClick={() => view.close()} />
            </ButtonSet>
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <UIKitCustomConfig />
    </React.StrictMode>
);