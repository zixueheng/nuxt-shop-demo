<template>
    <div>
        <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />

        <van-row type="flex" justify="space-between" class="filter-box">
            <van-col span="5" class="filter">
                <span>销量</span>
                <span>
                    <van-icon name="arrow-up" class="el-icon" @click="filterBy('sales_sum', 'asc', 0)" :class="{'avtive': 0 == filterIndex}"/>
                    <van-icon name="arrow-down" class="el-icon" @click="filterBy('sales_sum', 'desc', 1)" :class="{'avtive': 1 == filterIndex}"/>
                </span>
            </van-col>
            <van-col span="5" class="filter">
                <span>价格</span>
                <span>
                    <van-icon name="arrow-up" class="el-icon" @click="filterBy('shop_price', 'asc', 2)" :class="{'avtive': 2 == filterIndex}"/>
                    <van-icon name="arrow-down" class="el-icon" @click="filterBy('shop_price', 'desc', 3)" :class="{'avtive': 3 == filterIndex}"/>
                </span>
            </van-col>
            <van-col span="5" class="filter">
                <span>评论数</span>
                <span>
                    <van-icon name="arrow-up" class="el-icon" @click="filterBy('comment_count', 'asc', 4)" :class="{'avtive': 4 == filterIndex}"/>
                    <van-icon name="arrow-down" class="el-icon" @click="filterBy('comment_count', 'desc', 5)" :class="{'avtive': 5 == filterIndex}"/>
                </span>
            </van-col>
            <van-col span="5" class="filter">
                <span>新品</span>
                <span>
                    <van-icon name="arrow-up" class="el-icon" @click="filterBy('is_new', 'asc', 6)" :class="{'avtive': 6 == filterIndex}"/>
                    <van-icon name="arrow-down" class="el-icon" @click="filterBy('is_new', 'desc', 7)" :class="{'avtive': 7 == filterIndex}"/>
                </span>
            </van-col>
        </van-row>

        <van-grid :border="false" :column-num="2">
            <van-grid-item v-for="(goods, index) in list" :key="index">
                <nuxt-link :to="'/goods?id='+goods.goods_id">
                    <van-image :src="goods.original_img" />
                    <!-- <img :src="goods.original_img" v-lazy="img" > -->
                    <div class="categoy-name center">{{ goods.goods_name }}</div>
                </nuxt-link>
                <div class="price center">￥{{ goods.shop_price }}</div>
            </van-grid-item>
        </van-grid>

        <div v-if="isLoading" class="load-tips">
            <div>加载中...</div>
        </div>

        <div v-if="loadMore==false" class="load-tips">
            <div>没有更有了！</div>
        </div>
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
            title: "商品列表",
            category_id: 0,
            sort: "",
            sort_asc: "",
            filterIndex: -1,
            page: 1,
            list: [], //数据
            isLoading: false, //是否显示加载提示
            loadMore: true, //是否还有下一页数据
            endOfTheScreen: false //是否滚动到窗口底部
        };
    },
    validate({ query }) {
        if (!query.id) {
            throw new Error("ID 是必须的！");
        }
        if (!/^\d+$/.test(query.id)) {
            throw new Error("ID 必须是数字！");
        }
        return true;
    },
    // async asyncData({ $axios, query }) {
    //     const { result: ajaxData } = await $axios.$get(
    //         "goods/goodsList/p/1/id/" + query.id
    //     );
    //     return { ajaxData };
    // },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        fetchData(p = 1) {
            if (!this.loadMore) {
                return;
            }
            let url = `goods/goodsList/p/${p}/id/${this.category_id}`;
            if (this.sort) {
                url += `/sort/${this.sort}`;
            }
            if (this.sort_asc) {
                url += `/sort_asc/${this.sort_asc}`;
            }
            // console.log(url);
            this.isLoading = true;
            this.$axios.$get(url).then(res => {
                this.isLoading = false;
                let goods_list = res.result.goods_list;
                if (goods_list.length) {
                    this.list = this.list.concat(goods_list);
                } else {
                    this.loadMore = false;
                }
            });
        },
        //窗口滚动事件
        checkScroll() {
            return (
                window.scrollY + window.innerHeight ==
                document.documentElement.offsetHeight
            );
        },
        //排序
        filterBy(sort, sort_asc, index) {
            this.filterIndex = index;
            this.sort = sort;
            this.sort_asc = sort_asc;
            this.list = [];
            this.page = 1;
            this.loadMore = true;
            this.fetchData(this.page++);
        }
    },
    created() {
        if (this.$route.query.id) {
            this.category_id = this.$route.query.id;
            this.fetchData(this.page++);
            window.onscroll = () => {
                //绑定窗口滚动事件
                this.endOfTheScreen = this.checkScroll();
            };
        }
    },
    watch: {
        //监听窗口是否滚动到底
        endOfTheScreen(newValue) {
            if (newValue) {
                this.fetchData(this.page++); //加载下一页数据
            }
        }
    }
};
</script>
<style>
.load-tips {
    text-align: center;
    color: #7d7e80;
    font-size: 14px;
}
.filter-box {
    margin-top: 12px;
}
.filter{
    text-align: center;
    font-size: 14px;
}
.filter span{
    display: inline;
}
.el-icon {
    /* display: block; */
    font-size: 14px;
}
.avtive {
    color:#1989fa;
}
</style>