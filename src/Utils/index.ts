

export function isValidUrl(str: string) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

export async function getFaviconUrl(url: string) {
    const response = await fetch(`https://favicongrabber.com/api/grab/${encodeURIComponent(url)}`);
    const data = await response.json();
    if (data.icons && data.icons.length > 0) {
        // Return the URL of the first icon (usually the largest)
        return data.icons[0].src;
    } else {
        // Favicon not found
        return null;
    }
}