import request from "../../utils/request";
Page({
    data: {
        bannerList: [],
        recommendList: [],
        topList: [],
    },

    onLoad: async function (options) {
        let bannerListData = await request("/banner", {
            type: 1,
        });
        this.setData({
            bannerList: bannerListData.banners,
        });

        let recommendListData = await request("/personalized", { limit: 10 });
        this.setData({
            recommendList: recommendListData.result,
        });

        let index = 0;
        let resultArr = [];
        while (index < 5) {
            let topListData = await request("/top/list", { idx: index++ });
            let topListItem = {
                name: topListData.playlist.name,
                tracks: topListData.playlist.tracks.slice(0, 3),
            };
            resultArr.push(topListItem);
        }
        this.setData({
            topList: resultArr,
        });
    },

    toRecommendsong() {
        wx.navigateTo({
            url: "/songPackge/pages/recommendSong/recommendSong",
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
