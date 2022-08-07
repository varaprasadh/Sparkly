
// redirect to varaprasadh.dev
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: "https://varaprasadh.dev"
    })
});


chrome.runtime.onInstalled.addListener(reason => {
    if (reason.reason === "install") {
        chrome.runtime.setUninstallURL('https://varaprasadhalajangi.typeform.com/to/aHwBcN');
    }
});
