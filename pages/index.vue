<template>
    <div class>
        <van-nav-bar :title="title" />

        <van-search placeholder="请输入搜索关键词" readonly @click="goSearch()" />

        <van-swipe :autoplay="3000">
            <van-swipe-item v-for="(item, index) in ajaxData.ad" :key="index">
                <img :src="item.ad_code" class="lunbo" />
            </van-swipe-item>
        </van-swipe>

        <van-grid :border="false" :column-num="5">
            <van-grid-item v-for="(category, index) in ajaxData.categories" :key="index">
                <nuxt-link :to="'/list?id='+category.id">
                    <van-image :src="category.image" />
                    <div class="categoy-name center">{{ category.name}}</div>
                </nuxt-link>
            </van-grid-item>
        </van-grid>

        <div class="goods-list" v-for="(item, index) in ajaxData.goods" :key="index">
            <div v-if="item.goods_list.length">
                <div class="block-title">
                    <h3>{{ item.name }}</h3>
                </div>
                <van-grid :border="false" :column-num="2">
                    <van-grid-item v-for="(goods, index2) in item.goods_list" :key="index2">
                        <nuxt-link :to="'/goods?id='+goods.goods_id">
                            <van-image :src="goods.original_img" />
                            <div class="categoy-name center">{{ goods.goods_name }}</div>
                        </nuxt-link>
                        <div class="price center">￥{{ goods.shop_price }}</div>
                    </van-grid-item>
                </van-grid>
            </div>
        </div>

        <van-tabbar v-model="nav_active">
            <van-tabbar-item name="home" icon="home-o" to="/">首页</van-tabbar-item>
            <van-tabbar-item name="category" icon="apps-o" to="/category">分类</van-tabbar-item>
            <van-tabbar-item name="cart" icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
            <van-tabbar-item name="user" icon="user-o" to="/user">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
// import Header from "~/components/header.vue";

export default {
    components: {
        // Header
    },
    head() {
        return {
            title: this.title,
            meta: [
                { hid: "description", name: "description", content: "商城描述" }
            ]
        };
    },
    data() {
        return {
            title: "Nuxt 示例商城",
            nav_active: "home"
        };
    },
    async asyncData({ $axios }) {
        const { result: ajaxData } = await $axios.$get("Index/home");
        return { ajaxData };
    },
    created() {
        // console.log(this.ajaxData);
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        goSearch() {
            this.$router.push({ path: "/search" });
        }
    }
};
</script>

<style>
.lunbo {
    display: block;
    width: 100%;
    height: 180px;
}
.categoy-name {
    height: 24px;
    line-height: 24px;
    font-size: 13px;
    margin-top: 5px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
}
.block-title {
    margin: 0;
    padding: 25px 5px 15px;
    color: #2c3e50;
    font-weight: normal;
    font-size: 14px;
}
.block-title h3 {
    border-left: 5px solid #1899dc;
    padding-left: 5px;
}
</style>
