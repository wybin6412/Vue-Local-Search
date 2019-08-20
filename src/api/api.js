import axios from 'axios';
// import router from '../routerManuaConfig'
import router from '../router/index'
import store from "../store";
import Vue from 'vue';

var endIndex = window.location.href.indexOf("/apiui");
var apiHost = window.location.href.substring(0,endIndex);
let base = apiHost;
// let base = 'http://localhost:9115';


// 请求超时时间--豪秒
axios.defaults.timeout = 70000

// var storeTemp = store;
axios.interceptors.request.use(
    // config => {
    //     var curTime = new Date()
    //     var expiretime = new Date(Date.parse(storeTemp.state.tokenExpire))

    //     if (storeTemp.state.token && (curTime < expiretime && storeTemp.state.tokenExpire)) {
    //         // 判断是否存在token，如果存在的话，则每个http header都加上token
    //         config.headers.Authorization = "Bearer " + storeTemp.state.token;
    //     }

    //     saveRefreshtime();

    //     return config;
    // },
    // err => {
    //     return Promise.reject(err);
    // }
);

// http response 拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // 超时请求处理
        var originalRequest = error.config;
        if(error.code == 'ECONNABORTED' && error.message.indexOf('timeout')!=-1 && !originalRequest._retry){

            Vue.prototype.$message({
                message: '请求超时！',
                type: 'error'
            });

            originalRequest._retry = true
            return null;
        }

        if (error.response) {
            if (error.response.status == 401) {
                var curTime = new Date()
                var refreshtime = new Date(Date.parse(window.localStorage.refreshtime))
                // 在用户操作的活跃期内
                if (window.localStorage.refreshtime && (curTime <= refreshtime)) {
                    return  refreshToken({token: window.localStorage.Token}).then((res) => {
                        if (res.success) {
                            Vue.prototype.$message({
                                message: 'refreshToken success! loading data...',
                                type: 'success'
                            });

                            store.commit("saveToken", res.token);

                            var curTime = new Date();
                            var expiredate = new Date(curTime.setSeconds(curTime.getSeconds() + res.expires_in));
                            store.commit("saveTokenExpire", expiredate);

                            error.config.__isRetryRequest = true;
                            error.config.headers.Authorization = 'Bearer ' + res.token;
                            return axios(error.config);
                        } else {
                            // 刷新token失败 清除token信息并跳转到登录页面
                            ToLogin()
                        }
                    });
                } else {
                    // 返回 401，并且不知用户操作活跃期内 清除token信息并跳转到登录页面
                    ToLogin()
                }

            }
            // 403 无权限
            if (error.response.status == 403) {
                Vue.prototype.$message({
                    message: '失败！该操作无权限',
                    type: 'error'
                });
                return null;
            }
             // 500
             if (error.response.status == 500 || error.response.status == 404 || error.response.status == 400) {
                Vue.prototype.$message({
                    message: '失败！服务器异常' + error.response.status,
                    type: 'error',
                    duration: 3000
                });
                var res = { data: {
                    success: false,
                    message:"失败！服务器异常." + error.response.status
                  } }
                return res;
            }
        }
        return ""; // 返回接口返回的错误信息
    }
);

// 登录
export const requestLogin = params => {
    return axios.post(`${base}/PDALoginUser/LogToolLogin`, params);
};

export const getData = params => {
    return axios.post(`${base}/PDALoginUser/GetDataByKeyStr`, params);
};

export const reuploadData = params => {
    return axios.post(`${base}/PDALoginUser/ReuploadData`, params);
};


export const requestLoginMock = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const refreshToken = params => {
    return axios.get(`${base}/api/login/RefreshToken`, {params: params}).then(res => res.data);
};

export const saveRefreshtime = params => {

    let nowtime = new Date();
    let lastRefreshtime = window.localStorage.refreshtime ? new Date(window.localStorage.refreshtime) : new Date(-1);
    let expiretime = new Date(Date.parse(window.localStorage.TokenExpire))

    let refreshCount=1;//滑动系数
    if (lastRefreshtime >= nowtime) {
        lastRefreshtime=nowtime>expiretime ? nowtime:expiretime;
        lastRefreshtime.setMinutes(lastRefreshtime.getMinutes() + refreshCount);
        window.localStorage.refreshtime = lastRefreshtime;
    }else {
        window.localStorage.refreshtime = new Date(-1);
    }
};
 const ToLogin = params => {
     store.commit("saveToken", "");
     store.commit("saveTokenExpire", "");
     store.commit("saveTagsData", "");
     window.localStorage.removeItem('user');
     window.localStorage.removeItem('NavigationBar');

     router.replace({
         path: "/login",
         query: {redirect: router.currentRoute.fullPath}
     });

      window.location.reload()

};

export const getUserByToken = params => {
    return axios.get(`${base}/api/user/getInfoByToken`, {params: params}).then(res => res.data);
};


export function testapi2() {
    console.log('api is ok.')
}

export const testapi = pa => {
    console.log('api is ok.')
}







