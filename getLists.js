function Request(url, option) {
    let param = { method: 'GET', mode: 'cors', cache: 'no-cache' };
    option = Object.assign({ isJson: true, useHeaders: true }, option);
    if (option.useHeaders) {
        param.headers = {
            authorization: 'Bearer ' + window.localStorage.getItem('token'),
            os: 2
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
// 获取课程列表，列表中有音频的相对地址
function fetchLessonList(id) {
    const url = `https://service.lilyclass.com/api/courses/simple/CoursesAndScene/${id}`;
    return Request(url).then((res) => {
        const lessons = res?.data?.units?.[0]?.lessons || [];
        let list = [];
        lessons.forEach((v) => {
            list.push(...v.elements);
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
    console.log('%cGenerating Files...', 'color: green; font-weight: bold;font-size: 16px');
    fetchLessonList(courseId)
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
                // 音频不需要添加后缀，wget会自动添加
                audio: allList.map((v) => [v[1], v[2]]),
                // m3u8下载不会自动添加后缀，默认后缀是ts，改成mp4也是OK的
                video: allList.map((v) => [v[0], v[2] + '.mp4'])
            };
            Object.keys(fileMap).forEach((v) => {
                const fileName = `list_${v}.txt`;
                const fileContent = fileMap[v].map((k) => k.join(' ')).join('\n');
                downloadFile(fileName, fileContent);
            });
        });
}

generateFilesForCourse(1080);
