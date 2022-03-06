import request from "../../utils/request";
let isSend = false;
Page({
    data: {
        placeholderContent: "",
        hotList: [], //热搜榜数据
        searchContent: "", //用户输入表单数据
        searchList: [], //搜索数据
        historyList: [], //历史记录
    },

    onLoad: function (options) {
        this.getInitData();
        this.getSearchHistory();
    },

    async getInitData() {
        let placeholderData = await request("/search/default");
        let hotListData = await request("/search/hot/detail");
        this.setData({
            placeholderContent: placeholderData.data.showKeyword,
            hotList: hotListData.data,
        });
    },

    handleInputChange(event) {
        this.setData({
            searchContent: event.detail.value.trim(),
        });
        if (isSend) {
            return;
        }
        isSend = true;

        setTimeout(() => {
            this.getSearchList();
            isSend = false;
        }, 300);
    },

    getSearchHistory() {
        let historyList = wx.getStorageSync("searchHistory");
        if (historyList) {
            this.setData({
                historyList,
            });
        }
    },

    async getSearchList() {
        if (!this.data.searchContent) {
            this.setData({
                searchList: [],
            });
            return;
        }
        let { searchContent, historyList } = this.data;
        let searchListData = await request("/search", {
            keywords: searchContent,
            limit: 10,
        });
        this.setData({
            searchList: searchListData.result.songs,
        });

        if (historyList.indexOf(searchContent) === -1) {
            historyList.splice(historyList.indexOf(searchContent), 1);
        }
        historyList.unshift(searchContent);
        this.setData({
            historyList,
        });
        wx.setStorageSync("searchHistory", historyList);
    },
    clearSearchHistory() {
        this.setData({
            searchContent: "",
            searchList: [],
        });
    },

    deleteSearchHistory() {
        wx.showModal({
            content: "确认删除",
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        historyList: [],
                    });
                    wx.removeStorageSync("searchHistory");
                }
            },
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
