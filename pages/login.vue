<template>
    <div class="login">
        <h1>登录页面</h1>
        <van-cell-group>
            <van-field
                v-model="username"
                required
                clearable
                label="用户名"
                right-icon="question-o"
                placeholder="请输入手机号"
                @click-right-icon="$toast('手机号为11位')"
            />

            <van-field v-model="password" type="password" label="密码" placeholder="请输入密码" required />
        </van-cell-group>
        <van-button type="info" @click="login()">登录</van-button>
    </div>
</template>
<script>
import md5 from "js-md5";
export default {
    head() {
        return {
            title: this.title
        };
    },
    data() {
        return {
            title: "会员登录",
            username: "",
            password: ""
        };
    },
    methods: {
        async login() {
            if (this.username == "") {
                this.$toast("请输入手机号");
                return;
            }
            if (this.password == "") {
                this.$toast("请输入密码");
                return;
            }
            if (!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(this.username)) {
                this.$toast("手机号格式不正确");
                return;
            }
            let unique_id = this.genUniqueId();
            let result = await this.$axios.$post("user/login", {
                username: this.username,
                password: this.password,
                unique_id: unique_id
            });
            if (result.status == 1) {
                window.localStorage.setItem("user_id", result.result.user_id);
                window.localStorage.setItem("token", result.result.token);
                window.localStorage.setItem("unique_id", unique_id);

                // console.log(this.$route.query.redirect, location.hostname);
                // 判断上个页面的域名是不是和登录页的域名一样，也就是说判断是不是你的项目，如果不是就跳转到首页
                if (this.$route.query.redirect == location.hostname) {
                    this.$router.go(-1); //登录成功后返回上一页
                } else {
                    this.$router.push({ path: "/" });
                }
            } else {
                this.$toast(result.msg);
                return;
            }
        },
        genUniqueId() {
            var date = new Date();
            var rand = this.getRandomNum(100000, 999999);
            return md5(date + rand);
        },
        getRandomNum(Min, Max) {
            var Range = Max - Min;
            var Rand = Math.random();
            return Min + Math.round(Rand * Range);
        }
    },
    created() {}
};
</script>

<style>
.login {
    margin-top: 10px;
}
.login h1 {
    text-align: center;
    font-size: 18px;
}
</style>