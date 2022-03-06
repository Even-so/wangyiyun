import request from "../../utils/request";

Page({
    data: {
        day: "",
        mon: "",
        recommendList: [],
        index: 0,
    },

    onLoad: function (options) {
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

        this.setData({
            day: new Date().getDate(),
            mon: new Date().getMonth() + 1,
        });

        this.getRecommendList();

        PubSub.subscribe("switchType", (msg, type) => {
            let { recommendList, index } = this.data;
            if (type === "pre") {
                index === 0 && (index = recommendList.length);
                index -= 1;
            } else {
                index === recommendList.length - 1 && (index = -1);
                index += 1;
            }

            this.setData({
                index,
            });
            let musicId = recommendList[index].id;

            PubSub.publish("musicId", musicId);
        });
    },

    async getRecommendList() {
        let recommendListData = await request("/recommend/songs");
        this.setData({
            recommendList: recommendListData.recommend,
        });
    },

    toSongDetail(event) {
        let { song, index } = event.currentTarget.dataset;
        this.setData({
            index,
        });
        wx.navigateTo({
            url: "/pages/songDetail/songDetail?musicId=" + song.id,
        });
    },

    onReady: function () {},

    onShow: function () {},

    onHide: function () {},

    onUnload: function () {},

    onPullDownRefresh: function () {},

    onReachBottom: function () {},

    onShareAppMessage: function () {},
});
