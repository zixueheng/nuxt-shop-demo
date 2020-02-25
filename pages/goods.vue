<template>
    <div class="goods">
        <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />

        <van-swipe class="goods-swipe" :autoplay="3000">
            <van-swipe-item v-for="(thumb, index) in ajaxData.gallery" :key="index">
                <img :src="thumb.image_url" />
            </van-swipe-item>
        </van-swipe>

        <van-cell-group>
            <van-cell>
                <div class="goods-title">{{ ajaxData.goods.goods_name }}</div>
                <div class="goods-price">￥{{ ajaxData.goods.shop_price }}</div>
            </van-cell>
            <van-cell class="goods-express">
                <van-col span="10" v-if="ajaxData.goods.is_free_shipping==1">免邮费</van-col>
                <van-col span="14">剩余：{{ ajaxData.goods.store_count }}</van-col>
            </van-cell>
        </van-cell-group>

        <van-cell-group class="goods-cell-group">
            <van-cell value="进入店铺" icon="shop-o" is-link @click="sorry">
                <template slot="title">
                    <span class="van-cell-text">{{ ajaxData.store.store_name }}</span>
                    <!-- <van-tag class="goods-tag" type="danger">官方</van-tag> -->
                </template>
            </van-cell>
            <!-- <van-cell title="线下门店" icon="location-o" is-link @click="sorry" /> -->
        </van-cell-group>

        <van-cell-group class="goods-cell-group">
            <van-cell title="商品详情" />
            <div v-html="filterStyle(ajaxData.goods.goods_content)" class="goods_detail"></div>
        </van-cell-group>

        <van-goods-action>
            <van-goods-action-icon icon="home-o" to="/">主页</van-goods-action-icon>
            <van-goods-action-icon icon="chat-o" @click="sorry">客服</van-goods-action-icon>
            <van-goods-action-icon icon="cart-o" to="/cart">购物车</van-goods-action-icon>
            <van-goods-action-button type="warning" @click="showSkuBox">加入购物车</van-goods-action-button>
            <van-goods-action-button type="danger" @click="showSkuBox">立即购买</van-goods-action-button>
        </van-goods-action>

        <van-sku
            v-model="showSku"
            :sku="sku"
            :goods="goods"
            :goods-id="goodsId"
            :quota="quota"
            :quota-used="quotaUsed"
            @buy-clicked="onBuyClicked"
            @add-cart="onAddCartClicked"
        />
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
            title: "商品详情",
            showSku: false,
            goodsId: 0,
            goods: {},
            quota: 0, //限购数，0 表示不限购
            quotaUsed: 0, //已经购买过的数量
            sku: {} //规格参数
        };
    },
    async asyncData({ $axios, query }) {
        const { result: ajaxData } = await $axios.$get(
            "goods/goodsInfo/id/" + query.id
        );
        return { ajaxData };
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        sorry() {
            this.$toast("暂无后续逻辑~");
        },
        filterStyle(html) {
            var newContent = html.replace(/<img[^>]*>/gi, function(
                match,
                capture
            ) {
                var match = match.replace(/style=\"(.*)\"/gi, "");
                match = match.replace(/width=\"(.*)\"/gi, "");
                match = match.replace(/heigth=\"(.*)\"/gi, "");
                return match;
            });
            return newContent;
        },
        showSkuBox() {
            this.showSku = true;
        },
        async onBuyClicked(data) {
            console.log("buy:" + JSON.stringify(data));
            let param = {goods_id: this.goodsId, goods_num: data.selectedNum, emptyCart: 1};
            if(!this.sku.none_sku){
                param.goods_spec = data.selectedSkuComb.id;
            }
            // console.log("Param:" + JSON.stringify(param));
            let result = await this.$axios.$post('Cart/addCart', param);
            // console.log(JSON.stringify(result));
            if(result.status == 1){
                this.$router.push('/checkout');
            }else{
                this.$toast(result.msg);
            }
        },
        async onAddCartClicked(data) {
            console.log("add cart:" + JSON.stringify(data));
            let param = {goods_id: this.goodsId, goods_num: data.selectedNum};
            if(!this.sku.none_sku){
                param.goods_spec = data.selectedSkuComb.id;
            }
            // console.log("Param:" + JSON.stringify(param));
            let result = await this.$axios.$post('Cart/addCart', param);
            // console.log(JSON.stringify(result));
            if(result.status == 1){
                this.$toast(result.msg);
                this.showSku = false;
            }else{
                this.$toast(result.msg);
            }
        }
        // async fetchData() {
        //     const { result: ajaxData } = await this.$axios.$get('goods/goodsInfo/id/' + this.$route.query.id);
        //     this.ajaxData = ajaxData;
        // }
    },
    // created() {
    //     // 这里要求导航完成后获取数据
    //     this.fetchData();

    // }
    created() {
        this.goods = {
            // 商品标题
            title: this.ajaxData.goods.goods_name,
            // 默认商品 sku 缩略图
            picture: this.ajaxData.goods.original_img
        };
        this.goodsId = this.ajaxData.goods.goods_id;

        if (this.ajaxData.goods.goods_spec_list.length) {
            /** 
            let sku = {
                // 所有sku规格类目与其值的从属关系，比如商品有颜色和尺码两大类规格，颜色下面又有红色和蓝色两个规格值。
                // 可以理解为一个商品可以有多个规格类目，一个规格类目下可以有多个规格值。
                tree: [
                    {
                        k: "颜色",
                        k_id: "1",
                        v: [
                            {
                                id: "30349",
                                name: "天蓝色",
                                imgUrl: ""
                            },
                            {
                                id: "1215",
                                name: "白色"
                            }
                        ],
                        k_s: "s1",
                        count: 2
                    },
                    {
                        k: "尺寸",
                        k_id: "2",
                        v: [
                            {
                                id: "1193",
                                name: "1"
                            },
                            {
                                id: "1194",
                                name: "2"
                            }
                        ],
                        k_s: "s2",
                        count: 2
                    }
                ],
                // 所有 sku 的组合列表，如下是：白色1、白色2、天蓝色1、天蓝色2
                list: [
                    {
                        id: 2259,
                        price: 120, //价格
                        discount: 122,
                        s1: "1215",
                        s2: "1193",
                        s3: "0",
                        s4: "0",
                        s5: "0",
                        stock_num: 20, //库存
                        goods_id: 946755
                    },
                    {
                        id: 2260,
                        price: 110,
                        discount: 112,
                        s1: "1215",
                        s2: "1194",
                        s3: "0",
                        s4: "0",
                        s5: "0",
                        stock_num: 2, //库存
                        goods_id: 946755
                    },
                    {
                        id: 2257,
                        price: 130,
                        discount: 132,
                        s1: "30349",
                        s2: "1193",
                        s3: "0",
                        s4: "0",
                        s5: "0",
                        stock_num: 40, //库存
                        goods_id: 946755
                    },
                    {
                        id: 2258,
                        price: 100,
                        discount: 100,
                        s1: "30349",
                        s2: "1194",
                        s3: "0",
                        s4: "0",
                        s5: "0",
                        stock_num: 50, //库存
                        goods_id: 946755
                    }
                ],
                price: "5.00",
                stock_num: 227, // 商品总库存
                none_sku: false, // 是否无规格商品
                hide_stock: false // 是否隐藏剩余库存
            };
            */
            this.sku = {
                price: this.ajaxData.goods.shop_price,
                stock_num: parseInt(this.ajaxData.goods.store_count), // 商品总库存
                none_sku: false, // 是否无规格商品
                hide_stock: false, // 是否隐藏剩余库存
                tree: [],
                list: []
            };
            var tree = [];
            this.ajaxData.goods.goods_spec_list.forEach(spec => {
                var index = tree.findIndex(item => item.k == spec.spec_name);
                if(index == -1){
                    tree.push({k: spec.spec_name, v: [{id: spec.item_id, name: spec.item, imgUrl:''}], k_s: `s${tree.length+1}`});
                }else{
                    tree[index].v.push({id: spec.item_id, name: spec.item, imgUrl:''});
                }
            });
            // console.log(JSON.stringify(tree));
            tree.forEach((t, i) => {
                this.$set(this.sku.tree, i, t);
            });
            var list = [];
            this.ajaxData.spec_goods_price.forEach(item => {
                let ids = item.key.split('_');
                let list_item = {id: item.key, price: item.price*100, stock_num: parseInt(item.store_count)};
                ids.forEach(id => {
                    // tree.forEach((tree_item, tree_index) => {
                    //     let find = tree_item.v.findIndex(vi => vi.id==id);
                    //     if(find >= 0){
                    //         list_item[tree_item.k_s] = id;
                    //         return false;
                    //     }
                    // });
                    for(let tree_item of tree) {
                        let find = tree_item.v.findIndex(vi => vi.id==id);
                        if(find >= 0){
                            list_item[tree_item.k_s] = id;
                            break;
                        }
                    }
                });
                list.push(list_item);
            });
            // console.log(JSON.stringify(list));
            list.forEach((t, i) => {
                this.$set(this.sku.list, i, t);
            });
        } else {
            this.sku = {
                price: this.ajaxData.goods.shop_price,
                stock_num: parseInt(this.ajaxData.goods.store_count), // 商品总库存
                none_sku: true, // 是否无规格商品
                hide_stock: false, // 是否隐藏剩余库存
                tree: [],
                list: []
            };
        }
        // console.log(JSON.stringify(this.sku));
    }
};
</script>

<style>
.goods {
    padding-bottom: 50px;
}
.goods-swipe img {
    width: 100%;
    display: block;
}
.goods-title {
    font-size: 16px;
}
.goods-price {
    color: #f44;
}
.goods-express {
    color: #999;
    font-size: 12px;
    padding: 5px 15px;
}
.goods-cell-group {
    margin: 15px 0;
}
.goods-cell-group .van-cell__value {
    color: #999;
}
.goods-tag {
    margin-left: 5px;
}
.goods_detail {
    color: #999;
    padding: 0 16px;
}
.goods_detail img {
    display: block;
    width: 100%;
}
</style>