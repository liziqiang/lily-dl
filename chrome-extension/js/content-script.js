// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    generateFilesForCourse(request);
});
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == 'lily-connect') {
        port.onMessage.addListener(function (msg) {
            const { type, message } = msg;
            switch (type) {
                case 'download':
                    port.postMessage({ data: '课程下载地址生成中...' });
                    generateFilesForCourse(message).then(() => {
                        port.postMessage({ data: '课程下载地址已生成' });
                    });
                    break;
                case 'detect':
                    fetchCourseList().then((list) => {
                        port.postMessage({ data: list });
                    });
            }
        });
    }
});

// 获取token
function getToken() {
    return window.localStorage.getItem('token');
}

function Request(url, option) {
    let param = { method: 'GET', mode: 'cors', cache: 'no-cache' };
    option = Object.assign({ isJson: true, useHeaders: true }, option);
    const token = getToken();
    if (option.useHeaders && token) {
        param.headers = {
            os: 2,
            authorization: 'Bearer ' + token
        };
    }
    return fetch(url, param).then((response) => {
        return option.isJson ? response.json() : response.text();
    });
}

// 下载视频及音频列表文件，用于wget或者m3u8下载
function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// 获取全部课程列表
function fetchCourseList() {
    const courseMap = {
        1: '学习中',
        2: '已结课',
        3: '已关闭'
    };
    const url = 'https://service.lilyclass.com/api/coursesrecords/navigationall';
    const token = getToken();
    let list = [];
    if (token) {
        list = Object.keys(courseMap).map((v) => {
            return Request(`${url}?status=${v}`).then((k) => {
                return (k?.data || []).map((m) => {
                    return { ...m, courseTag: courseMap[v] };
                });
            });
        });
    }
    return Promise.all(list).then(([...res]) => {
        let list = [];
        res.forEach((v) => {
            list.push(...v);
        });
        return {
            name: window.localStorage.getItem('eName'),
            token,
            list: list
                .filter((m) => m.courses)
                .map((k) => {
                    k.courses.courseTag = k.courseTag;
                    return k.courses;
                })
        };
    });
}
// 获取课程视频列表，列表中有音频的相对地址
function fetchLessonList(id) {
    const url = `https://service.lilyclass.com/api/courses/simple/CoursesAndScene/${id}`;
    return Request(url).then((res) => {
        const units = res?.data?.units || []
        let list = [];
        units.forEach((v) => {
            const lessons = v.lessons || [];
            lessons.forEach((v) => {
                list.push(...v.elements);
            });
        });
        return list.filter((v) => v.type === 0);
    });
}
// 获取课程详情
function fetchLessonDetail(id) {
    const url = `https://service.lilyclass.com/api/elements/${id}`;
    return Request(url);
}
// 获取课程视频地址
function fetchVideoStream(vid) {
    const cb = 'cb';
    const url = `https://p.bokecc.com/servlet/getvideofile?vid=${vid}&siteid=37508DE550B566E6&hlssupport=1&callback=${cb}`;
    // jsonp返回需要特殊处理一下
    return Request(url, { isJson: false, useHeaders: false }).then((res) =>
        JSON.parse(res.substring(cb.length + 1, res.length - 1))
    );
}

function generateFilesForCourse(courseId) {
    // console.log('%cGenerating Files...', 'color: green; font-weight: bold;font-size: 16px');
    return fetchLessonList(courseId)
        .then((list) => {
            return Promise.all(
                list.map((v) => {
                    return fetchLessonDetail(v.id).then((res) => {
                        const video = res?.data?.video;
                        const audio = `https://video.lilyclass.com/${video.audio}`;
                        return fetchVideoStream(video.ccVid).then((stream) => {
                            const copies = stream?.copies || [];
                            const lessonName = res?.data?.name.replace(/\s+/g, '_');
                            const bestQuality = copies.sort((a, b) => a.quality - b.quality).pop();
                            return [bestQuality.playurl, audio, lessonName];
                        });
                    });
                })
            );
        })
        .then((allList) => {
            const fileMap = {
                audio: allList.map((v) => [v[1], v[2]]),
                video: allList.map((v) => [v[0], v[2]])
            };
            Object.keys(fileMap).forEach((v) => {
                const fileName = `list_${v}.txt`;
                const fileContent = fileMap[v].map((k) => k.join(' ')).join('\n');
                downloadFile(fileName, fileContent);
            });
            return Promise.resolve();
        });
}
