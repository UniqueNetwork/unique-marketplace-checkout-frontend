import { useState } from 'react';

export const useCopyToClipboard = (): [
    string | null,
    (text: string) => Promise<boolean>
] => {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const copy = async (text: string) => {
        if (!navigator?.clipboard) {
            return false;
        }
        try {
            setCopiedText(text);
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            setCopiedText(null);
            return false;
        }
    };

    return [copiedText, copy];
};

export default useCopyToClipboard;
