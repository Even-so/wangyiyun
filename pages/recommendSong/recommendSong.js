import request from "../../utils/request";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        day: "",
        mon: "",
        recommendList: [], //推荐列表数据
        index: 0, //点击音乐下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        /* 判断用户是否登录 */
        let userInfo = wx.getStorageInfoSync("userInfo");
        if (!userInfo) {
            wx.showToast({
                title: "请先登录",
                icon: "none",
                success: () => {
                    wx.reLaunch({
                        url: "/pages/login/login",
                    });
                },
            });
        }
        /* 获取日期数据 */
        this.setData({
            day: new Date().getDate(),
            mon: new Date().getMonth() + 1, //国内外不同+1
        });
        /* 获取每日推荐数据 */
        this.getRecommendList();

        /* 订阅来自songData页面发布消息 */
        PubSub.subscribe("switchType", (msg, type) => {
            let { recommendList, index } = this.data;
            if (type === "pre") {
                index === 0 && (index = recommendList.length);
                index -= 1;
            } else {
                index === recommendList.length - 1 && (index = -1);
                index += 1;
            }
            //更新最新下标
            this.setData({
                index,
            });
            let musicId = recommendList[index].id;
            //将音乐id回传songdetail页面
            PubSub.publish("musicId", musicId);
        });
    },

    /* 获取每日推荐数据 */
    async getRecommendList() {
        let recommendListData = await request("/recommend/songs");
        this.setData({
            recommendList: recommendListData.recommend,
        });
    },

    /* 跳转songDetail页面 */
    toSongDetail(event) {
        let { song, index } = event.currentTarget.dataset;
        this.setData({
            index,
        });
        wx.navigateTo({
            //不能直接传song对象
            // url: "/pages/songDetail/songDetail?song" + JSON.stringify(song),
            url: "/pages/songDetail/songDetail?musicId=" + song.id,
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
});
