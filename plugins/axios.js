/**
 * If you need to customize axios by registering interceptors and changing global config, you have to create a nuxt plugin.
 * 文档 https://axios.nuxtjs.org/extend
 */
import { Toast } from 'vant';
import Qs from 'qs';
export default function ({ $axios, redirect }) {

    // 发送请求时执行
    $axios.onRequest(config => {
        // 获取token，配置请求头
        let user_id = window.localStorage.getItem('user_id');
        let token = window.localStorage.getItem('token');
        let unique_id = window.localStorage.getItem('unique_id');

        if(config.method == 'post'){
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            config.data = Qs.stringify(config.data); // qs.stringify()将对象 序列化成URL的形式，以&进行拼接
        }
        if(user_id && token){
            config.headers['user-id'] = user_id;
            config.headers['token'] = token;
            config.headers['unique-id'] = unique_id;
        }
        
        // console.log(config);
        // console.log('Making request to ' + config.url);
    });
    //响应时执行
    $axios.onResponse(response => {
        // console.log(response);
        if(response.data.status == -100 || response.data.status == -101){
            window.localStorage.removeItem("user_id");
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("unique_id");
            Toast('请先登录！');
            redirect('/login', {redirect:location.hostname});
            return Promise.reject(response.data.msg); //reject 登录异常
        }
    });
    // 发生错误时执行
    $axios.onError(error => {
        const code = parseInt(error.response && error.response.status);
        if (code === 400) {
            redirect('/400');
        }
    });
}