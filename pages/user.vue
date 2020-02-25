<template>
    <div class>
        <img
            class="user-poster"
            src="https://img.yzcdn.cn/public_files/2017/10/23/8690bb321356070e0b8c4404d087f8fd.png"
        />
        {{ ajaxData.nickname }}
        <van-row class="user-links">
            <van-col span="6">
                <van-icon name="pending-payment" />待付款
            </van-col>
            <van-col span="6">
                <van-icon name="records" />待接单
            </van-col>
            <van-col span="6">
                <van-icon name="tosend" />待发货
            </van-col>
            <van-col span="6">
                <van-icon name="logistics" />已发货
            </van-col>
        </van-row>

        <van-cell-group class="user-group">
            <van-cell icon="records" title="全部订单" is-link />
        </van-cell-group>

        <van-cell-group>
            <van-cell icon="points" title="我的积分" is-link />
            <van-cell icon="gold-coin-o" title="我的优惠券" is-link />
            <van-cell icon="gift-o" title="我收到的礼物" is-link />
        </van-cell-group>

        <van-tabbar v-model="active">
            <van-tabbar-item name="home" icon="home-o" to="/">首页</van-tabbar-item>
            <van-tabbar-item name="category" icon="apps-o" to="/category">分类</van-tabbar-item>
            <van-tabbar-item name="cart" icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
            <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
export default {
    head() {
        return {
            title: this.title
        };
    },
    data() {
        return {
            title: "个人中心",
            active: "user",
            ajaxData: {}
        };
    },

    methods: {},
    created() {
        // 这里要求导航完成后获取数据
        this.$axios
            .$get("user/userInfo")
            .then(result => {
                this.ajaxData = result.result;
            })
            .catch(err => {
                console.log(err);
            });
    }
};
</script>

<style>
.user-poster {
    width: 100%;
    height: 53vw;
    display: block;
}
.user-group {
    margin-bottom: 15px;
}
.user-links {
    padding: 15px 0;
    font-size: 12px;
    text-align: center;
    background-color: #fff;
}
.user-links .van-icon {
    display: block;
    font-size: 24px;
}
</style>