<template>
    <div>
        <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />

        <van-checkbox-group class="card-goods" v-model="checkedGoods">
            <van-checkbox
                class="card-goods__item"
                v-for="(item, index) in goods"
                :key="item.id"
                :name="item.id"
                @click="updateSelect($event, index)"
            >
                <van-card
                    :title="item.title"
                    :desc="item.desc"
                    :price="formatPrice(item.price)"
                    :thumb="item.thumb"
                    :thumb-link="'/goods?id='+item.goods_id"
                >
                    <div slot="bottom" :style="{float:'right',height:'5vh'}">
                        <van-button
                            :style="{height:'5vh'}"
                            size="mini"
                            @click="cut($event, index)"
                        >-</van-button>
                        <span :style="{height:'5vh',fontSize:'15px'}">{{ item.num }}</span>
                        <van-button
                            size="mini"
                            :style="{height:'5vh'}"
                            @click="add($event, index)"
                        >+</van-button>

                        <van-button
                            type="default"
                            size="mini"
                            @click="remove($event,index)"
                            :style="{height:'5vh', fontSize:'15px'}"
                        >删除</van-button>
                    </div>
                </van-card>
            </van-checkbox>
        </van-checkbox-group>

        <van-submit-bar
            :price="totalPrice"
            :disabled="!checkedGoods.length"
            :button-text="submitBarText"
            @submit="onSubmit"
        >
            <van-checkbox
                @click="tap()"
                v-model="checked"
                :style="{marginLeft:'5vw',fontSize:'15px'}"
            >全选</van-checkbox>
        </van-submit-bar>
    </div>
</template>

<script>
import { Dialog } from "vant";
export default {
    head() {
        return {
            title: this.title
        };
    },
    data() {
        return {
            title: "购物车",
            checkedGoods: [],
            checked: false,
            goods: [
                // {
                //     id: "1",
                //     title: "进口香蕉",
                //     desc: "约250g，2根",
                //     price: 200,
                //     num: 1,
                //     thumb:
                //         "https://img.yzcdn.cn/public_files/2017/10/24/2f9a36046449dafb8608e99990b3c205.jpeg"
                // }
            ]
        };
    },
    computed: {
        submitBarText() {
            const count = this.checkedGoods.length;
            return "结算" + (count ? `(${count})` : "");
        },
        totalPrice() {
            return this.goods.reduce(
                (total, item) => total + (this.checkedGoods.indexOf(item.id) !== -1 ? item.price * item.num : 0),
                0
            );
        }
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        formatPrice(price) {
            return (price / 100).toFixed(2);
        },
        onSubmit(a) {
            if(this.goods.length == 0) {
                this.$toast('购物车中没有商品');
                return false;
            }
            this.$router.push('/checkout');
        },
        tap() {
            if (this.checked) {
                this.$axios
                    .$post("Cart/updateAllSelect", { selected: 0 })
                    .then(result => {
                        if (result.status == 1) {
                            this.checkedGoods = [];
                        } else {
                            this.$toast("取消全选失败！");
                        }
                    });
            } else {
                this.$axios
                    .$post("Cart/updateAllSelect", { selected: 1 })
                    .then(result => {
                        if (result.status == 1) {
                            this.checkedGoods = [];
                            this.goods.forEach(item => {
                                this.checkedGoods.push(item.id);
                            });
                        } else {
                            this.$toast("全选失败！");
                        }
                    });
            }
        },
        updateSelect(data, index) {
            if (this.checkedGoods.indexOf(this.goods[index].id) !== -1) {
                // 取消
                this.$axios
                    .$post("Cart/updateSelect", {
                        id: this.goods[index].id,
                        selected: 0
                    })
                    .then(result => {
                        if (result.status == 1) {
                        } else {
                            this.$toast("取消失败！");
                        }
                    });
            } else {
                // 选中
                this.$axios
                    .$post("Cart/updateSelect", {
                        id: this.goods[index].id,
                        selected: 1
                    })
                    .then(result => {
                        if (result.status == 1) {
                        } else {
                            this.$toast("选中失败！");
                        }
                    });
            }
        },
        remove(e, a) {
            e.cancelBubble = true;
            Dialog.confirm({
                title: "确定删除?"
            })
                .then(() => {
                    this.$axios
                        .$post("Cart/delCart", { id: this.goods[a].id })
                        .then(result => {
                            if (result.status == 1) {
                                let index = this.checkedGoods.findIndex(
                                    id => id == this.goods[a].id
                                );
                                if (index >= 0) {
                                    this.checkedGoods.splice(index, 1);
                                }
                                this.goods.splice(a, 1);
                            } else {
                                this.$toast("删除购物车商品失败！");
                            }
                        });
                })
                .catch(() => {
                    // on cancel
                });
        },
        add(e, a) {
            e.cancelBubble = true;
            this.updateNum(this.goods[a].id, this.goods[a].num + 1).then(
                result => {
                    if (result.status == 1) {
                        // this.goods[a].num++;
                        this.$set(this.goods[a], "num", this.goods[a].num + 1);
                    } else {
                        this.$toast("修改购车商品数量失败！");
                    }
                }
            );
        },
        cut(e, a) {
            e.cancelBubble = true;
            if (this.goods[a].num <= 1) {
                this.$toast("最少一件商品");
                return false;
            } else {
                this.updateNum(this.goods[a].id, this.goods[a].num - 1).then(
                    result => {
                        if (result.status == 1) {
                            // this.goods[a].num--;
                            this.$set(
                                this.goods[a],
                                "num",
                                this.goods[a].num - 1
                            );
                        } else {
                            this.$toast("修改购车商品数量失败！");
                        }
                    }
                );
            }
        },
        async updateNum(id, num) {
            return await this.$axios.$post("Cart/updateNum", {
                id: id,
                num: num
            });
        }
    },
    created() {
        // 这里要求导航完成后获取数据
        this.$axios
            .$get("Cart/cartList")
            .then(result => {
                result.result.forEach((item, index) => {
                    this.$set(this.goods, index, {
                        id: item.id, //购物车ID
                        goods_id: item.goods_id,
                        title: item.goods_name,
                        desc: item.spec_key_name,
                        price: item.shop_price * 100,
                        num: parseInt(item.goods_num),
                        thumb: item.image
                    });
                    if (item.selected == 1) {
                        this.$set(
                            this.checkedGoods,
                            this.checkedGoods.length,
                            item.id
                        );
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });
    },
    watch: {
        checkedGoods: {
            handler: function() {
                if (this.checkedGoods.length == this.goods.length) {
                    this.checked = true;
                } else {
                    this.checked = false;
                }
            }
        }
    }
};
</script>

<style>
.card-goods {
    padding: 0;
    background-color: #fff;
    margin-bottom: 50px;
}
.card-goods__item {
    position: relative;
    background-color: #fafafa;
}
.card-goods__item .van-checkbox__label {
    width: 100%;
    height: auto;
    padding: 0 10px 0 15px;
    box-sizing: border-box;
}
.card-goods__item .van-checkbox__icon {
    top: 40%;
    left: 10px;
    z-index: 1;
    position: absolute;
    margin-top: -10px;
}
.card-goods__item .van-card__price {
    color: #f44;
    height: 5vh;
    min-width: 50px;
    font-size: 20px;
    line-height: 5vh;
    text-align: center;
}
.card-goods__item {
    margin-bottom: 1vh;
}

.van-card__title {
    height: 10vh;
    line-height: 5vh;
    font-size: 20px;
}
.van-button--mini {
    min-width: 30px;
    font-size: 20px;
}
</style>