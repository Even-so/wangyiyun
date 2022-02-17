import request from "../../../utils/request";
import PubSub from "pubsub-js";
import moment from "moment";
const appInstance = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isPlay: false,
        song: {}, //歌曲详细数据'
        musicId: "", //音乐ID
        musicLink: "", //音乐链接
        currentTime: "00:00", //实时时长
        durationTime: "00:00", //总时长
        currentWidth: 0, //实时进度条的宽度
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //options接收路由传参的数据,参数有长度限制,会截取
        // console.log(options);
        // console.log(JSON.parser(options));
        let musicId = options.musicId;
        this.setData({
            musicId,
        });
        this.getMusicInfo(musicId);

        /* 判断当前是否播放 */
        if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
            this.setData({
                isPlay: true,
            });
        }

        /* 监听系统暂停播放 */
        this.backgroundAudioManager = wx.getBackgroundAudioManager();
        this.backgroundAudioManager.onPlay(() => {
            this.changePlayState(true);

            appInstance.globalData.musicId = musicId;
        });
        this.backgroundAudioManager.onPause(() => {
            this.changePlayState(false);
        });
        this.backgroundAudioManager.onStop(() => {
            this.changePlayState(false);
        });
        /* 监听音乐自然播放结束 */
        this.backgroundAudioManager.onEnded(() => {
            PubSub.publish("switchType", "next");
            this.setData({
                currentWidth: 0,
                currentTime: "00:00", //实时时长
            });
        });

        //监听音乐实时进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            //格式化实时时长
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format(
                "mm:ss"
            );
            let currentWidth =
                (this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration) *
                450;
            this.setData({
                currentTime,
                currentWidth,
            });
        });
    },
    /* 修改播放状态功能函数 */
    changePlayState(isPlay) {
        this.setData({
            isPlay,
        });
        //修改全局状态
        appInstance.globalData.isMusicPlay = isPlay;
    },
    //获取音乐详细
    async getMusicInfo(musicId) {
        let songData = await request("/song/detail", { ids: musicId });
        // songData.songs[0].dt;
        let durationTime = moment(songData.songs[0].dt).format("mm:ss");

        this.setData({
            song: songData.songs[0],
            durationTime,
        });
        wx.setNavigationBarTitle({
            title: this.data.song.name,
        });
    },
    /* 播放暂停的回调 */
    handleMusicPlay() {
        let isPlay = !this.data.isPlay;
        /* 修改状态 */
        // this.setData({
        //     isPlay,
        // });
        let { musicId, musicLink } = this.data;
        this.musicControl(isPlay, musicId, musicLink);
    },
    /* 播放暂停功能的函数 */
    async musicControl(isPlay, musicId, musicLink) {
        if (isPlay) {
            if (!musicLink) {
                //获取音乐播放链接
                let musicLinkData = await request("/song/url", { id: musicId });
                musicLink = musicLinkData.data[0].url;
                this.setData({
                    musicLink,
                });
            }

            this.backgroundAudioManager.src = musicLink;
            this.backgroundAudioManager.title = this.data.song.name;
        } else {
            this.backgroundAudioManager.pause();
        }
    },
    /* 点击切歌的回调 */
    handleSwitch(event) {
        //获取切歌的类型
        let type = event.currentTarget.id;
        //关闭当前音乐
        this.backgroundAudioManager.stop();
        //订阅来自recommendSong页面发布的musicId消息
        PubSub.subscribe("musicId", (msg, musicId) => {
            //获取音乐详细信息
            this.getMusicInfo(musicId);
            //自动播放音乐
            this.musicControl(true, musicId);
            //取消订阅
            PubSub.unsubscribe("musicId");
        });
        //发布消息数据给recommendSong页面
        PubSub.publish("switchType", type);
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
