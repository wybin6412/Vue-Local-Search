<template>
    <div class="wrapper">
        <ul class="bg-bubbles">
            <li v-for="n in 10"></li>
            <ol v-for="n in 5"></ol>
        </ul>
        <div class="bg bg-blur" style="display: none;"></div>
        <div style="height: 10%;"></div>
        <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px"
                 class="demo-ruleForm login-container" >
            <h3 class="title">本地库查询登录({{loginWHName}})</h3>
            <!-- <el-form-item prop="whname">
                <el-input type="text" disabled v-model="loginWHName" auto-complete="off" placeholder="仓库"></el-input>
            </el-form-item> -->
            <el-form-item prop="account">
                <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
            </el-form-item>
            <el-form-item prop="checkPass">
                <el-input v-model="ruleForm2.checkPass" auto-complete="off" show-password placeholder="密码"></el-input>
            </el-form-item>
            <!-- <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox> -->
            <!-- <div style="margin-bottom: 20px;" class="count-test">
                <el-radio-group @change="loginAccount" v-model="account3">
                    <el-radio-button label="账号1"></el-radio-button>
                    <el-radio-button label="管理员"></el-radio-button>
                </el-radio-group>
            </div> -->
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">
                    {{loginStr}}
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import {requestLogin, getNavigationBar} from '../api/api';
    import util from "../../util/date";
    import router from '@/router'
    import {resetRouter, filterAsyncRouter} from '@/router/index'

    export default {
        data() {
            return {
                instance: "",
                loginStr: '登录',
                logining: false,
                loginingMock: false,
                loginWhid:"",
                loginWHName:"",
                ruleForm2: {
                    account: '',
                    checkPass: ''
                },
                account3: '账号1',
                rules2: {
                    account: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        //{ validator: validaePass }
                    ],
                    checkPass: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        //{ validator: validaePass2 }
                    ]
                },
                checked: true
            };
        },
        methods: {
            handleReset2() {
                this.$refs.ruleForm2.resetFields();
            },
            loginAccount() {
            },
            openAlert(msg) {
                this.instance = this.$notify({
                    title: '提示',
                    message: msg,
                    duration: 0,
                    position: 'top-left'
                });
            },
            closeAlert() {
                this.instance.close()
            },
            //登录
            handleSubmit2(ev) {
                var _this = this;
                this.$refs.ruleForm2.validate((valid) => {
                    if (valid) {
                        _this.logining = true;
                        _this.loginStr = "登录中...";
                        //NProgress.start();
                        var loginParams = {UserNo: this.ruleForm2.account, PassWord: this.ruleForm2.checkPass};                        

                        requestLogin(loginParams).then(res => {
                            if (util.isEmt.format(res)) {
                                _this.logining = false;
                                _this.loginStr = "重新登录";

                                _this.$message({
                                    message: `登录失败，服务器出错啦`,
                                    type: 'error'
                                });
                                return;
                            }

                            if (!res.data.retObj.success) {
                                _this.logining = false;
                                _this.loginStr = "重新登录";

                                _this.$message({
                                    // message: res.data.message,
                                    message: `登录失败，检查账号密码是否正确`,
                                    type: 'error'
                                });
                               
                                // _this.closeAlert()
                            } else {

                                var token = res.data.retObj.token;
                                _this.$store.commit("saveToken", token);

                                var curTime = new Date();
                                var expires_in = 3600;
                                // var expiredate = new Date(curTime.setSeconds(curTime.getSeconds() + data.expires_in));
                                var expiredate = new Date(curTime.setSeconds(curTime.getSeconds() + expires_in));
                                _this.$store.commit("saveTokenExpire", expiredate);

                                window.localStorage.refreshtime = expiredate;
                                // window.localStorage.expires_in = data.expires_in;
                                window.localStorage.expires_in = expires_in;

                                _this.$notify({
                                    type: "success",
                                    message: res.data.retObj.message + `，本次登录将在 ${window.localStorage.expires_in / 60} 分钟后过期！`,
                                    duration: 3000
                                });

                                _this.logining = false;
                                this.$router.push('/user');
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            // 获取路由树
            GetNavigationBar(uid) {
                var _this = this;
                var loginParams = {uid: uid, t: new Date()};

                getNavigationBar(loginParams).then(data => {
                    _this.logining = false;

                    if (!data.success) {
                        _this.$message({
                            message: data.message,
                            type: 'error'
                        });
                    } else {
                        _this.$message({
                            message: "后台初始化成功",
                            type: 'success'
                        });


                        let userinfo = JSON.parse(window.localStorage.user ? window.localStorage.user : null);
                        _this.$notify({
                            type: "success",
                            message: `登录成功 \n 欢迎管理员：${userinfo.uRealName} ！Token 将在 ${window.localStorage.expires_in / 60} 分钟后过期！`,
                            duration: 6000
                        });


                        window.localStorage.router = (JSON.stringify(data.response.children));

                        let getRouter = data.response.children//后台拿到路由
                        getRouter = filterAsyncRouter(getRouter) //过滤路由
                        router.addRoutes(getRouter) //动态添加路由

                        _this.$router.replace(_this.$route.query.redirect ? _this.$route.query.redirect : "/");
                    }
                });
            }
        },
        created() {
            var endIndex = window.location.href.indexOf("/apiui");
            var port = window.location.href.substring(endIndex - 5, endIndex);
            if (port == ":2364") {
                this.loginWhid = ":5180";
            } else {
                this.loginWhid = port;
            }

            if ((this.loginWhid == ":5180")) {
                this.loginWHName = "成都XX"+ "301";
            } else if ((this.loginWhid == ":5480")) {
                this.loginWHName = "顺德XX"+ "101";
            }
        },
        mounted() {
            window.localStorage.clear()
            console.info('%c 本地缓存已清空!', "color:green")
        },
    }

</script>

<style>
    .bg {
        margin: 0px;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: url(../assets/loginbck.png) no-repeat top left;
        background-repeat: no-repeat;
        background-size: cover;
        width: 100%;
        height: 100%;
    }

    .login-container {
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: auto;
        width: 300px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        z-index: 9999;
        position: relative;
    }

    .login-container .title {
        margin: 0px auto 40px auto;
        text-align: center;
        color: #505458;
    }

    .login-container .remember {
        margin: 0px 0px 25px 0px;
    }

    li {
    }

    .wrapper {
        background: #EDF4ED;
        background: -webkit-linear-gradient(top left, #EDF4ED 0%, #53e3a6 100%);
        background: linear-gradient(to bottom right, #127c7b 0, #EDF4ED);
        opacity: 0.8;
        position: absolute;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .wrapper.form-success .containerLogin h1 {
        -webkit-transform: translateY(85px);
        -ms-transform: translateY(85px);
        transform: translateY(85px);
    }

    .containerLogin {
        max-width: 600px;
        margin: 0 auto;
        padding: 80px 0;
        height: 400px;
        text-align: center;
    }

    .containerLogin h1 {
        font-size: 40px;
        -webkit-transition-duration: 1s;
        transition-duration: 1s;
        -webkit-transition-timing-function: ease-in-put;
        transition-timing-function: ease-in-put;
        font-weight: 200;
    }

    .bg-bubbles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .bg-bubbles li, .bg-bubbles ol {
        position: absolute;
        list-style: none;
        display: block;
        width: 40px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.15);
        bottom: -160px;
        -webkit-animation: square 25s infinite;
        animation: square 25s infinite;
        -webkit-transition-timing-function: linear;
        transition-timing-function: linear;
    }

    ol {
        padding: 0 !important;
    }

    .bg-bubbles ol:nth-child(11) {
        left: 10%;
        top: 10%;
        width: 20px;
        height: 20px;
    }

    .bg-bubbles ol:nth-child(12) {
        left: 20%;
        top: 40%;

        width: 60px;
        height: 60px;
    }

    .bg-bubbles ol:nth-child(13) {
        left: 65%;
        top: 30%;

        width: 100px;
        height: 60px;
    }

    .bg-bubbles ol:nth-child(14) {
        left: 70%;
        top: 30%;
        width: 100px;
        height: 150px;
    }

    .bg-bubbles ol:nth-child(15) {
        left: 50%;
        top: 70%;

        width: 40px;
        height: 60px;
    }

    .bg-bubbles li:nth-child(1) {
        left: 10%;
    }

    .bg-bubbles li:nth-child(2) {
        left: 20%;
        width: 80px;
        height: 80px;
        -webkit-animation-delay: 2s;
        animation-delay: 2s;
        -webkit-animation-duration: 17s;
        animation-duration: 17s;
    }

    .bg-bubbles li:nth-child(3) {
        left: 25%;
        -webkit-animation-delay: 4s;
        animation-delay: 4s;
    }

    .bg-bubbles li:nth-child(4) {
        left: 40%;
        width: 60px;
        height: 60px;
        -webkit-animation-duration: 22s;
        animation-duration: 22s;
        background-color: rgba(255, 255, 255, 0.25);
    }

    .bg-bubbles li:nth-child(5) {
        left: 70%;
    }

    .bg-bubbles li:nth-child(6) {
        left: 80%;
        width: 120px;
        height: 120px;
        -webkit-animation-delay: 3s;
        animation-delay: 3s;
        background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-bubbles li:nth-child(7) {
        left: 32%;
        width: 160px;
        height: 160px;
        -webkit-animation-delay: 7s;
        animation-delay: 7s;
    }

    .bg-bubbles li:nth-child(8) {
        left: 55%;
        width: 20px;
        height: 20px;
        -webkit-animation-delay: 15s;
        animation-delay: 15s;
        -webkit-animation-duration: 40s;
        animation-duration: 40s;
    }

    .bg-bubbles li:nth-child(9) {
        left: 25%;
        width: 10px;
        height: 10px;
        -webkit-animation-delay: 2s;
        animation-delay: 2s;
        -webkit-animation-duration: 40s;
        animation-duration: 40s;
        background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-bubbles li:nth-child(10) {
        left: 90%;
        width: 160px;
        height: 160px;
        -webkit-animation-delay: 11s;
        animation-delay: 11s;
    }

    @-webkit-keyframes square {
        0% {
            -webkit-transform: translateY(0);
            transform: translateY(0);
        }

        100% {
            -webkit-transform: translateY(-700px) rotate(600deg);
            transform: translateY(-700px) rotate(600deg);
        }
    }

    @keyframes square {
        0% {
            -webkit-transform: translateY(0);
            transform: translateY(0);
        }

        100% {
            -webkit-transform: translateY(-700px) rotate(600deg);
            transform: translateY(-700px) rotate(600deg);
        }
    }

    .content-az {
        padding: 0 !important;
        border: none !important;
    }
</style>
