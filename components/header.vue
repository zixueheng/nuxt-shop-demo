<template>
    <van-nav-bar
        title="title"
        left-text=""
        left-arrow
        @click-left="onClickLeft"
    />
</template>
<script>
export default {
	props: ['title'],
    methods: {
        onClickLeft() {
            Toast("返回");
        },
        onClickRight() {
            Toast("按钮");
        }
    }
};
</script>
<style>
</style>
