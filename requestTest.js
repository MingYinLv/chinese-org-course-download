/**
 * Created by MingYin Lv on 2017/1/14.
 */

import request from 'request';

request.get('http://www.chinesemooc.org/kvideo.php?do=course_progress&kvideoid=4747&classesid=1971', {
    headers: {
        cookie: 'PHPSESSID=26uagjgfv5n63g69ot9spp46n0; pku_auth=6a0fxg5NjYTyBss12JYSTq3kS58PKg%2FFZ5Era7HLEHo01lFcf8KKP7wnNxWbTPykUgtBhmEWGHGmMsDZ0sGJuW6y3I%2BK; pku_loginuser=lvmingyin%40vip.qq.com; pku_reward_log=daylogin%2C1064917; pku__refer=%252Fkvideo.php%253Fdo%253Dcourse_homework_stut%2526kvideoid%253D4747%2526classesid%253D1971; Hm_lvt_ff4f6e9862a4e0e16fd1f5a7f6f8953b=1484378511,1484378906,1484378907,1484378923; Hm_lpvt_ff4f6e9862a4e0e16fd1f5a7f6f8953b=1484382226'
    }
}, (error, response, body) => {
    if (!error && response.statusCode == 200) {

    }
});
