/**
 * Created by MingYin Lv on 2017/1/14.
 */


import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import request from 'request';
import querystring from 'querystring';
import url from 'url';
import http from 'http';

const courseUrl = 'http://www.chinesemooc.org/kvideo.php?do=course_progress&kvideoid=4417&classesid=1864';  // 报名之后的课程列表
const urlObj = url.parse(courseUrl);
const courseList = [];
var downloadPath = 'H:/视频/';

getHtml(courseUrl).then(function (html) {
    analysisCourseList(html);
});

/**
 * 获得指定url的html代码
 * @param url
 */
function getHtml(url) {
    console.log(url);
    return new Promise(function (resolve) {
        request.get(url, {
            headers: {
                cookie: 'PHPSESSID=26uagjgfv5n63g69ot9spp46n0; pku_auth=6a0fxg5NjYTyBss12JYSTq3kS58PKg%2FFZ5Era7HLEHo01lFcf8KKP7wnNxWbTPykUgtBhmEWGHGmMsDZ0sGJuW6y3I%2BK; pku_loginuser=lvmingyin%40vip.qq.com; pku_reward_log=daylogin%2C1064917; pku__refer=%252Fkvideo.php%253Fdo%253Dcourse_homework_stut%2526kvideoid%253D4747%2526classesid%253D1971; Hm_lvt_ff4f6e9862a4e0e16fd1f5a7f6f8953b=1484378511,1484378906,1484378907,1484378923; Hm_lpvt_ff4f6e9862a4e0e16fd1f5a7f6f8953b=1484382226'
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
        });
    });
}

/**
 * 解析课程主页，获得所有课程的名称和下载地址
 * @param html
 */
function analysisCourseList(html) {
    var $ = cheerio.load(html);
    // 获得课程名字
    var title = $('title').text().trim();
    title = title.substr(0, title.indexOf(' -   华文慕课 - 中文MOOC平台'));
    downloadPath = path.join(downloadPath, replaceBadCharOfFileName(title) + '/');
    // 创建课程文件夹
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }
    // 获得课程列表
    var items = $('#coursefile .file-lists .item');
    items.each((index, n) => {
        n = $(n);
        // 分类名称
        var name = `${n.find('.section-name').text()}.${n.find('.section-title').text().trim()}`;
        var details = [];
        var detailLis = n.find('.item-detail li');
        for (let i = 0; i < detailLis.length; i++) {
            var temp = detailLis[i];
            temp = $(temp);
            // 获得课程下载地址接口
            if (temp.find('.icon-spow-wrap a.video').length >= 1) {
                // 只有视频才下载
                var course_url = url.parse(temp.find('.icon-spow-wrap a.video').attr('href'));
                var query = querystring.parse(course_url.query);

                details.push({
                    course_name: `${temp.find('.order_num').text()} ${temp.find('.order_num_content_title').text()}`,
                    course_url: `${urlObj.protocol}//${urlObj.host}/api/course_video_watch.php?course_id=${query.id}&eid=${query.eid}`,
                });
            }
        }
        courseList.push({
            section_title: name,
            details,
        });
    });
    console.log('已获得所有课程，开始下载');
    downloadAll(courseList);
}

/**
 * 解析单个课程, 获得下载地址
 * @param json
 */
function analysisCourseItem(json) {
    var obj = JSON.parse(json);
    return obj.msg.mp4_url;
}

/**
 * 根据courseList下载文件
 * @param courseList
 */
async function downloadAll(courseList) {
    for (let i = 0, max = courseList.length; i < max; i++) {
        var temp = courseList[i];
        // 获得分类下的所有课程
        var details = temp.details;
        for (let j = 0, jmax = details.length; j < jmax; j++) {
            var detail = details[j];
            // 获得单个视频的html
            var html = await getHtml(detail.course_url);
            console.log('%s:%s 开始下载...', temp.section_title, detail.course_name);
            // 解析获得下载地址
            var downloadUrl = analysisCourseItem(html);
            console.log(downloadUrl);
            // 下载
            download(downloadUrl, temp.section_title, detail.course_name);
        }
    }
}

/**
 * 下载文件
 * @param downloadUrl
 * @param sectionName 分类名称
 * @param courseName 课程名称
 */
function download(downloadUrl, sectionName, courseName) {
    var urlTemp = url.parse(downloadUrl);
    http.get({
        host: urlTemp.host,
        path: urlTemp.path,
        headers: {
            cookie: 'PHPSESSID=26uagjgfv5n63g69ot9spp46n0; pku_auth=6a0fxg5NjYTyBss12JYSTq3kS58PKg%2FFZ5Era7HLEHo01lFcf8KKP7wnNxWbTPykUgtBhmEWGHGmMsDZ0sGJuW6y3I%2BK; pku_loginuser=lvmingyin%40vip.qq.com; pku_reward_log=daylogin%2C1064917; pku__refer=%252Fkvideo.php%253Fdo%253Dcourse_homework_stut%2526kvideoid%253D4747%2526classesid%253D1971; Hm_lvt_ff4f6e9862a4e0e16fd1f5a7f6f8953b=1484378511,1484378906,1484378907,1484378923; Hm_lpvt_ff4f6e9862a4e0e16fd1f5a7f6f8953b=1484382226'
        }
    }, (res) => {
        res.setEncoding('binary');
        const dirPath = path.join(downloadPath, `/${replaceBadCharOfFileName(sectionName)}/`);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        const file = fs.createWriteStream(path.join(dirPath, `${replaceBadCharOfFileName(courseName)}${getSuffix(urlTemp.path)}`));
        file.setDefaultEncoding('binary');
        res.on('data', function (thunk) {
            file.write(thunk, 'binary');
        });

        res.on('end', function () {
            file.end();
            console.log('%s:%s 下载完成.', sectionName, courseName);
        });

    });
}

function getSuffix(filepath) {
    var d = /\.[^\.]+$/.exec(filepath);
    return d[0];
}

/**
 * 去掉非法字符
 * @param string
 */
function replaceBadCharOfFileName(fileName) {
    var str = fileName;
    str = str.replace("\\", '');
    str = str.replace("/", '');
    str = str.replace(":", '');
    str = str.replace("*", '');
    str = str.replace("?", '');
    str = str.replace("\"", '');
    str = str.replace("<", '');
    str = str.replace(">", '');
    str = str.replace("|", '');
    str = str.replace(" ", '');
    return str;
}
