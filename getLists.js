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

function fetchLessonDetail(id) {
    const url = `https://service.lilyclass.com/api/elements/${id}`;
    return Request(url);
}

function fetchVideoStream(vid) {
    const cb = 'cb';
    const url = `https://p.bokecc.com/servlet/getvideofile?vid=${vid}&siteid=37508DE550B566E6&hlssupport=1&callback=${cb}`;
    // jsonp返回需要特殊处理一下
    return Request(url, { isJson: false, useHeaders: false }).then((res) =>
        JSON.parse(res.substring(cb.length + 1, res.length - 1))
    );
}

function grabbingLessons(courseId) {
    console.log('processing...\n');
    fetchLessonList(courseId).then((list) => {
        return Promise.all(list.map((v) => {
            return fetchLessonDetail(v.id).then((res) => {
                const video = res?.data?.video;
                const audio = `https://video.lilyclass.com/${video.audio}`;
                return fetchVideoStream(video.ccVid).then((stream) => {
                    const copies = stream?.copies || [];
                    const bestQuality = copies.sort((a, b) => a.quality - b.quality).pop();
                    return [bestQuality.playurl, audio, res?.data?.name];
                });
            });
        }));
    }).then((allList) => {
        // const audioUrlList = allList.map((v) => v[1]);
        // const videoUrlList = allList.map((v) => v[0]);
        // console.log('audioUrlList:\n');
        // console.log(audioUrlList.reduce((prev, next) => `${prev + next}\n`, ''));
        // console.log('videoUrlList:\n');
        // console.log(videoUrlList.reduce((prev, next) => `${prev + next}\n`, ''));

        console.log(allList.reduce((prev, next) => `${prev + next.join(' ')}\n`, ''));
    });
}

grabbingLessons(1080);
