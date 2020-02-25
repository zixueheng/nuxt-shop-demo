<template>
    <div class="category">
        <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />

        <van-row>
            <van-col span="6">
                <van-sidebar v-model="tree_avtive" @change="selectCategory">
                    <van-sidebar-item :title="item.name" v-for="item in ajaxData" :key="item.id" />
                </van-sidebar>
            </van-col>
            <van-col span="18">
                <div class="side-right">
                    <ul>
                        <li v-for="side in side_right" :key="side.id">
                            <nuxt-link :to="'/list?id='+side.id">{{ side.name }}</nuxt-link>
                            <ul>
                                <li v-for="sub in side.sub_category" :key="sub.id"><nuxt-link :to="'/list?id='+sub.id">{{ sub.name }}</nuxt-link></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </van-col>
        </van-row>

        <van-tabbar v-model="nav_active">
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
            title: "店铺分类",
            tree_avtive: 0,
            nav_active: "category",
            side_right: {}
        };
    },
    async asyncData({ $axios }) {
        const { result: ajaxData } = await $axios.$get(
            "Goods/goodsCategoryList"
        );
        return { ajaxData };
    },
    methods: {
        selectCategory(index) {
            // console.log(this.ajaxData[index].name);
            this.setSideRight(this.ajaxData[index].id);
        },
        onClickLeft() {
            this.$router.go(-1);
        },
        setSideRight(id) {
            this.$axios
                .$get("Goods/goodsSecAndThirdCategoryList/parent_id/" + id)
                .then(res => {
                    this.side_right = res.result;
                });
        }
    },
    created() {
        const id = this.ajaxData[0].id; // 第一个分类的ID
        this.setSideRight(id);
    }
};
</script>

<style>
.side-right {
    padding: 20px 12px 20px 8px;
    font-size: 14px;
    line-height: 20px;
    word-wrap: break-word;
}
.side-right ul {
    margin-bottom: 9px;
}
.side-right ul li ul li {
    display: inline;
    margin-right: 9px;
}
.side-right ul li ul li a{
    color: #7d7e80;
}
.van-sidebar-item {
    border: none;
}
.van-sidebar-item--select {
    border: none;
    color: #1989fa;
}
</style>