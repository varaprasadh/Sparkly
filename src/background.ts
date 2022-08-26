chrome.runtime.onInstalled.addListener(reason => {
    if (reason.reason === "install") {
        chrome.runtime.setUninstallURL('https://forms.gle/tKbaLR1QeEMsmKkN7');
    }
});
