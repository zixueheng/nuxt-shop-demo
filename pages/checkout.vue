<template>
    <div>
        <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />

        <div
            role="button"
            tabindex="0"
            class="van-cell van-cell--clickable van-cell--center van-cell--borderless van-contact-card"
            :class="cardType"
            @click="showAddressList"
        >
            <i class="van-icon van-cell__left-icon" :class="icon"></i>
            <div
                class="van-cell__value van-cell__value--alone van-contact-card__value"
                v-html="currentHtml"
            ></div>
            <i class="van-icon van-icon-arrow van-cell__right-icon"></i>
        </div>

        <!-- 联系人列表 -->
        <van-popup v-model="showList" position="bottom">
            <van-address-list v-model="chosenAddressId" :list="list" @add="onAdd" @edit="onEdit" />
        </van-popup>
        <!-- 联系人编辑 -->
        <van-popup v-model="showEdit" position="bottom">
            <van-cell-group class="van-address-edit">
                <van-field
                    v-model="input_name"
                    required
                    clearable
                    label="姓名"
                    placeholder="请输入收货人姓名"
                />
                <van-field
                    v-model="input_tel"
                    required
                    clearable
                    label="电话"
                    placeholder="请输入收货人电话"
                />
                <van-field
                    readonly
                    required
                    clickable
                    label="地区"
                    :value="input_area"
                    placeholder="选择省/市/区"
                    @click="showPicker = true"
                />
                <van-field
                    v-model="input_address"
                    required
                    label="地址"
                    type="textarea"
                    placeholder="请输入详细地址"
                    rows="1"
                    autosize
                />
                <van-field v-model="input_zipcode" clearable label="邮编" placeholder="请输入收货人邮编" />
                <div class="van-address-edit__buttons">
                    <van-button type="danger" size="normal" block @click="saveAddress">保存地址</van-button>
                    <van-button type="default" size="normal" block @click="deleteAddress">删除地址</van-button>
                </div>
            </van-cell-group>
        </van-popup>

        <van-popup v-model="showPicker" position="bottom">
            <van-area
                :area-list="area"
                :value="chosenAreaId"
                @cancel="showPicker = false"
                @confirm="onConfirm"
                @change="onChange"
            />
        </van-popup>

        <van-cell-group v-for="(list, store) in cartList" :key="store" class="cart-box">
            <van-cell :title="store" icon="shop-o" />
            <ul>
                <li v-for="goods in list" :key="goods.id">
                    <van-card
                        :num="goods.goods_num"
                        :price="goods.shop_price"
                        :desc="goods.spec_key_name"
                        :title="goods.goods_name"
                        :thumb="goods.image"
                    />
                </li>
            </ul>
        </van-cell-group>

        <van-radio-group v-model="payment_code" class="cart-box">
            <van-cell-group>
                <van-cell
                    v-for="payment in paymentList"
                    :key="payment.code"
                    :title="payment.name"
                    clickable
                    @click="payment_code = payment.code"
                    :name="payment.code"
                >
                    <van-radio slot="right-icon" :name="payment.code" />
                </van-cell>
            </van-cell-group>
        </van-radio-group>

        <van-submit-bar :price="totalPrice.total_fee * 100" button-text="提交订单" @submit="onSubmit" />
    </div>
</template>
<script>
var area_map = {}; // 实际区域ID 和 合成的 area id 的对应关系
var first_open = true;
export default {
    head() {
        return {
            title: this.title
        };
    },
    data() {
        return {
            title: "结算",
            chosenAddressId: null,
            currentAddress: {},
            cardType: {
                "van-contact-card--add": true,
                "van-contact-card--edit": false
            },
            icon: { "van-icon-add-square": true, "van-icon-contact": false },
            showList: false,
            showEdit: false,
            list: [],
            input_id: null,
            input_name: "",
            input_tel: "",
            input_address: "",
            input_zipcode: "",
            showPicker: false,
            area: {}, //全部区域，异步获取
            chosenArea: [], //选中的区域

            cartList: {}, //购物车数据

            totalPrice: {}, //总价格

            paymentList: [],
            payment_code: ""
        };
    },

    computed: {
        // 显示地址详情，由于这里直接使用用户输入的信息拼接html故存在安全隐患，需要后端将用户输入进行过滤，如：php执行 strip_tags,htmlspecialchars
        currentHtml() {
            if (this.chosenAddressId == null) {
                this.currentAddress = {};
            }
            return this.chosenAddressId == null
                ? "添加联系人"
                : `<div>${this.currentAddress.name}，${this.currentAddress.tel}</div><div>${this.currentAddress.address}</div>`;
        },
        // 地址表单中选中的区ID
        chosenAreaId() {
            return this.chosenArea.length ? this.chosenArea[2].code : "";
        },
        // 地址表单中 显示 省/市/区
        input_area() {
            return this.chosenArea.reduce((str, item, index) => {
                return (
                    str +
                    item.name +
                    (index < this.chosenArea.length - 1 ? "/" : "")
                );
            }, "");
        }
    },
    watch: {
        // 监听用户选择的默认地址
        chosenAddressId(newValue) {
            // 第一次打开不执行逻辑
            if (!first_open) {
                this.$axios
                    .$post("User/setDefaultAddress", { address_id: newValue })
                    .then(result => {
                        if (result.status == 1) {
                            let address = this.list.find(
                                item => item.id == newValue
                            );
                            this.currentAddress = {
                                name: address.name,
                                tel: address.tel,
                                address: address.address
                            };
                            this.showList = false;
                        } else {
                            // this.$toast(result.msg);
                            return false;
                        }
                    });
            } else {
                first_open = false;
            }
        }
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        // 显示地址列表
        showAddressList(callback) {
            this.fetchAddressList().then(() => {
                this.showList = true;
                if (callback) {
                    callback();
                }
            });
        },
        // 显示新建地址表单
        onAdd() {
            this.fetchArea();
            this.showList = false;
            this.showEdit = true;
            this.input_id = null; //重置地址表单ID
            this.input_name = "";
            this.input_tel = "";
            this.chosenArea = [];
            this.input_address = "";
            this.input_zipcode = "";
        },
        // 显示编辑地址表单
        onEdit(item, index) {
            let address = this.list[index];
            this.input_id = address.id; //重置地址表单ID
            this.input_name = address.name;
            this.input_tel = address.tel;
            this.input_address = address.detail_address;
            this.input_zipcode = address.zipcode;
            // 这里注意要在获取地址信息之后再设置 选中的区域
            this.fetchArea().then(() => {
                for (let k of Object.keys(area_map)) {
                    if (address.province == area_map[k]) {
                        this.$set(this.chosenArea, 0, {
                            code: k,
                            name: address.province_txt
                        });
                    }
                    if (address.city == area_map[k]) {
                        this.$set(this.chosenArea, 1, {
                            code: k,
                            name: address.city_txt
                        });
                    }
                    if (address.district == area_map[k]) {
                        this.$set(this.chosenArea, 2, {
                            code: k,
                            name: address.district_txt
                        });
                    }
                }
            });

            this.showList = false;
            this.showEdit = true;
        },
        // 异步获取区域数据
        async fetchArea() {
            // 如果已获取直接返回
            if (Object.keys(this.area).length != 0) {
                return false;
            }

            const result = await this.$axios.$get("User/getAllArea");
            let provinces = result.result;
            let province_list = {},
                city_list = {},
                county_list = {};
            provinces.forEach((province, index1) => {
                let key = 10 + index1 + "0000";
                // console.log(key);
                province_list[key] = province.name;
                area_map[key] = province.id;

                province.cities.forEach((city, index2) => {
                    let key = 10 + index1 + "" + (10 + index2) + "00";
                    // console.log('--'+key);
                    city_list[key] = city.name;
                    area_map[key] = city.id;

                    city.districts.forEach((district, index3) => {
                        let key =
                            10 +
                            index1 +
                            "" +
                            (10 + index2) +
                            "" +
                            (10 + index3);
                        // console.log('----'+key);
                        county_list[key] = district.name;
                        area_map[key] = district.id;
                    });
                });
            });
            this.area = { province_list, city_list, county_list };
        },
        // 异步获取地址列表
        async fetchAddressList() {
            let result = await this.$axios.$get("User/getAddressList");
            if (result.result) {
                this.list = [];
                result.result.forEach((item, index) => {
                    this.$set(this.list, index, {
                        id: item.address_id,
                        name: item.consignee,
                        tel: item.mobile,
                        address: item.address,
                        province: item.province,
                        city: item.city,
                        district: item.district,
                        province_txt: item.province_txt,
                        city_txt: item.city_txt,
                        district_txt: item.district_txt,
                        detail_address: item.detail_address,
                        zipcode: item.zipcode,
                        is_default: item.is_default
                    });
                });
                return true;
            } else {
                return false;
            }
        },
        onChange(picker, values) {
            // console.log(values);
        },
        // 确认区域选择
        onConfirm(data) {
            // console.log(JSON.stringify(data));
            this.chosenArea = data;
            this.showPicker = false;
        },
        // 保存地址
        saveAddress() {
            let province = "",
                city = "",
                district = "";
            // 查询实际后端区域ID
            this.chosenArea.forEach((area, index) => {
                if (index == 0) {
                    for (let k in area_map) {
                        if (k == area.code) {
                            province = area_map[k];
                            break;
                        }
                    }
                }
                if (index == 1) {
                    for (let k in area_map) {
                        if (k == area.code) {
                            city = area_map[k];
                            break;
                        }
                    }
                }
                if (index == 2) {
                    for (let k in area_map) {
                        if (k == area.code) {
                            district = area_map[k];
                            break;
                        }
                    }
                }
            });
            if (province == "" || city == "" || district == "") {
                this.$toast("请选择完整区域！");
                return false;
            }
            if (
                this.input_name == "" ||
                this.input_tel == "" ||
                this.input_address == ""
            ) {
                this.$toast("请输入姓名、电话、详细地址等必要信息！");
                return false;
            }
            let params = {
                consignee: this.input_name,
                mobile: this.input_tel,
                address: this.input_address,
                province,
                city,
                district
            };
            if (this.input_id != null) {
                params.address_id = this.input_id;
            }
            if (this.input_zipcode != "") {
                params.zipcode = this.input_zipcode;
            }
            // console.log(JSON.stringify(params));
            this.$axios.$post("User/addAddress", params).then(result => {
                if (result.status == 1) {
                    this.$toast(result.msg);
                    this.showEdit = false;
                    // showAddressList() 函数中有异步操作 这里需要用 回调函数方式 执行逻辑
                    this.showAddressList(() => {
                        if (this.input_id == this.chosenAddressId) {
                            let address = this.list.find(
                                item => item.is_default == 1
                            );
                            this.currentAddress = {
                                id: address.id,
                                name: address.name,
                                tel: address.tel,
                                address: address.address
                            };
                            this.chosenAddressId = address.id;
                        }
                    });
                } else {
                    this.$toast(result.msg);
                }
            });
        },
        // 删除地址
        deleteAddress() {
            console.log(this.input_id);
            if (this.input_id == null) {
                this.$toast("未选择地址");
                return false;
            }
            this.$axios
                .$post("User/del_address", { id: this.input_id })
                .then(result => {
                    if (result.status == 1) {
                        this.$toast(result.msg);

                        this.showEdit = false;
                        // showAddressList() 函数中有异步操作 这里需要用 回调函数方式 执行逻辑
                        this.showAddressList(() => {
                            if (this.list.length == 0) {
                                this.chosenAddressId = null;
                            } else {
                                // 如果删除的是当前地址 则要更新 chosenAddressId
                                if (this.input_id == this.chosenAddressId) {
                                    let address = this.list.find(
                                        item => item.is_default == 1
                                    );
                                    this.chosenAddressId = address.id;
                                }
                            }
                            this.showList = true; //chosenAddressId 监听函数会关闭地址列表，这里手动打开
                        });
                    } else {
                        this.$toast(result.msg);
                    }
                });
        },

        //提交订单
        onSubmit() {}
    },
    created() {
        this.$axios.$get("Cart/cart2").then(result => {
            if (result.status != 1) {
                this.$toast(result.msg);
                this.$router.go(-1);
            }
            if (result.result.addressList != "") {
                let address = result.result.addressList;
                this.chosenAddressId = address.address_id;
                this.cardType = {
                    "van-contact-card--add": false,
                    "van-contact-card--edit": true
                };
                this.icon = {
                    "van-icon-add-square": false,
                    "van-icon-contact": true
                };
                this.currentAddress = {
                    id: address.address_id,
                    name: address.consignee,
                    tel: address.mobile,
                    address:
                        address.province +
                        address.city +
                        address.district +
                        address.address
                };
            }
            if (result.result.cartList.length) {
                let cartList = {};
                result.result.cartList.forEach(item => {
                    if (Object.keys(cartList).indexOf(item.store_name) != -1) {
                        cartList[item.store_name].push({
                            goods_name: item.goods_name,
                            shop_price: item.shop_price,
                            image: item.image,
                            spec_key_name: item.spec_key_name,
                            goods_num: item.goods_num
                        });
                    } else {
                        cartList[item.store_name] = [
                            {
                                goods_id: item.goods_id,
                                goods_name: item.goods_name,
                                shop_price: item.shop_price,
                                image: item.image,
                                spec_key_name: item.spec_key_name,
                                goods_num: item.goods_num
                            }
                        ];
                    }
                });
                // console.log(JSON.stringify(cartList));
                this.cartList = cartList;
            }
            this.totalPrice = result.result.totalPrice;
            this.paymentList = result.result.paymentList;
        });
    }
};
</script>
<style>
.cart-box {
    padding: 16px 0;
}
</style>