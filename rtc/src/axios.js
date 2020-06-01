import Axios from 'axios'
import { Component } from 'react'
Component.prototype.$axios = Axios //将axios挂载到Component上，以供全局使用

Axios.defaults.headers.post['accept'] = 'application/json'; //配置请求头
Axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'; //配置请求头
Axios.interceptors.request.use((config) => {
    let user = JSON.parse(window.sessionStorage.getItem('access-user'));
    if (user) {
        token = user.token;
    }
    let urlProxy = config.url.substr(0, 4);
    if (urlProxy === "/rtc") {
        Axios.defaults.headers.post['accept'] = 'application/json'; //配置请求头
        Axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8'; //配置请求头
        Axios.defaults.headers.get['accept'] = 'application/json'; //配置请求头
        Axios.defaults.headers.get['Content-Type'] = 'application/json; charset=utf-8'; //配置请求头
    }
    // config.setHeaders([
    //     // 在这里设置请求头与携带token信息
    // ]);
    return config
}, (error) => {
    return Promise.reject(error);
});

//配置过滤器请求响应（通过查npm官网，axios文档）
Axios.interceptors.response.use(function (response) {
    return response.data;//只获取data数据
}, function (error) {
    return Promise.reject(error);
});