$(function () {
    sendMessageToContentScript({ type: 'detect' }, (msg) => {
        const { list, name } = msg.data || {};
        // 渲染课程列表
        $('#course_list').html(`
    	${list
            .map(
                (v) => `
    		<div class="course"><a href="javascript:;" course-id="${v.id}">【${v.courseTag}】${v.name}</a></div>
    	`
            )
            .join('')}
    	`);
        // 更新列表标题
        name && $('#title').text(`${name}的课程列表`);
    });
});
$('#course_list').on('click', '[course-id]', function () {
    const courseId = $(this).attr('course-id');
    sendMessageToContentScript({ type: 'download', message: courseId }, (msg) => {
        chrome.notifications.create(null, {
            type: 'basic',
            title: 'Lily英语',
            message: msg.data,
            iconUrl: 'img/icon.png'
        });
    });
});

// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

// 向content-script主动发送消息
function sendMessageToContentScript(data, callback) {
    getCurrentTabId((tabId) => {
        const port = chrome.tabs.connect(tabId, { name: 'lily-connect' });
        port.postMessage(data);
        port.onMessage.addListener(function (msg) {
            callback && callback(msg);
        });
    });
}
