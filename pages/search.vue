<template>
    <div class>
        <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />
        <!-- Tips: 在 van-search 外层增加 form 标签，且 action 不为空，即可在 iOS 输入法中显示搜索按钮 -->
        <form action="/">
            <van-search
                v-model="searchWords"
                placeholder="请输入搜索关键词"
                show-action
                @search="onSearch"
                @cancel="onCancel"
            />
        </form>
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
            title: this.title
        };
    },
    data() {
        return {
            title: "搜索",
            searchWords: ""
        };
    },

    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        onSearch() {
            alert(this.searchWords);
        },
        onCancel() {}
    }
};
</script>

<style>
</style>
