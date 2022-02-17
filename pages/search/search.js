// pages/search/search.js
import request from "../../utils/request";
let isSend = false;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        placeholderContent: "", //placeholder数据
        hotList: [], //热搜榜数据
        searchContent: "", //用户输入表单数据
        searchList: [], //搜索数据
        historyList: [], //历史记录
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getInitData();
        this.getSearchHistory();
    },
    //获取热搜榜数据
    async getInitData() {
        let placeholderData = await request("/search/default");
        let hotListData = await request("/search/hot/detail");
        this.setData({
            placeholderContent: placeholderData.data.showKeyword,
            hotList: hotListData.data,
        });
    },
    //表单内容发生改变的函数
    handleInputChange(event) {
        this.setData({
            searchContent: event.detail.value.trim(),
        });
        if (isSend) {
            return;
        }
        isSend = true;

        //函数节流
        setTimeout(() => {
            this.getSearchList();
            isSend = false;
        }, 300);
    },
    //获取本地历史记录
    getSearchHistory() {
        let historyList = wx.getStorageSync("searchHistory");
        if (historyList) {
            this.setData({
                historyList,
            });
        }
    },
    //发请求获取数据的函数
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
        //将搜索关键字添加进历史记录中
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
    //清空历史记录
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
