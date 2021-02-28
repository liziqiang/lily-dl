chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    // 只有打开指定域名才显示pageAction
                    new chrome.declarativeContent.PageStateMatcher({ pageUrl: { urlContains: 'lilyclass.com' } })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});
