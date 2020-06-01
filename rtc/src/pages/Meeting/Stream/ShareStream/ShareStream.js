import React, { Component } from 'react';
import { connect } from 'react-redux';
// import Stream from '../Stream';
import ShareStreamItem from './ShareStreamItem';
import './ShareStream.css';
// import { now } from 'moment';
// import _ from 'underscore';
import { Icon } from 'antd';

class ShareStream extends Component {
    constructor(props, context) {
        super(props, context);
        this.bigger = this.bigger.bind(this);
        this.shrink = this.shrink.bind(this);
        this.state = {
            set_width: '',
            set_height: '',
            x_width: '',
            x_height: '',
            show: 'block',
            hide: 'none'
        }
    }
    componentDidMount() {
        let share = document.getElementById("streamBox_share");
        let share_img = document.getElementById("share_img");
        console.log(share)
        share.onmouseover = function () {
            console.log('block')
            share_img.style.display = 'block';
        }
        share.onmouseout = function () {
            console.log('none')
            share_img.style.display = 'none';

        }
        let set_width;
        let set_height;
        let c_height = document.body.clientHeight / 5 * 4 - 64 - 40;//上半部分最大高度
        console.log(c_height, document.body.clientHeight)
        let d_width = document.body.clientWidth;//浏览器的宽
        let d_height = d_width / 4 * 3;//视频窗口的高
        let h_height = d_width / 16 * 9;//当前比例浏览器的高
        if (d_width / c_height > 16 / 9) {//宽高比大于16/9
            if (h_height > c_height) {
                let m_width = c_height / 9 * 16;
                console.log(m_width)
                set_width = m_width;
                set_height = c_height;
            } else {
                set_width = d_width;
                set_height = h_height;
            }
            console.log(d_width, h_height)
        } else if (d_width / c_height < 16 / 9 && d_width / c_height > 4 / 3) { //宽高比 16/9  4/3 的区间
            if (d_height > c_height) {
                let m_width = c_height / 3 * 4;
                set_width = m_width;
                set_height = c_height;
            } else {
                let m_height = d_width / 4 * 3;
                set_width = d_width;
                set_height = m_height;
            }

        } else if (d_width / c_height < 4 / 3) {//宽高比小于4/3
            console.log('以4/3来计算', 3333)
            set_width = d_width;
            set_height = d_height;
        }
        this.setState({
            set_width: set_width,
            set_height: set_height
        })
        console.log(set_width, set_height)
        let wrap_just = document.getElementById("wrap_just");
        let x_height = wrap_just.clientHeight;//小窗口的高度
        let x_width = x_height / 9 * 16;
        this.setState({
            x_width: x_width,
            x_height: x_height
        })
        console.log(x_width, x_height)
    }
    bigger() {
        let set_width;
        let set_height;
        let no_Share_Stream_Wrap = document.getElementById('no_Share_Stream_Wrap');
        let share_Stream_Box = document.getElementById('share_Stream_Box');
        no_Share_Stream_Wrap.style.display = "none";
        share_Stream_Box.style.background = 'black'
        const c_height = document.body.clientHeight;//浏览器的高
        const b_height = (c_height - 64);//视频窗口的高
        this.setState({
            set_width: '95%',
            set_height: b_height,
            show: 'none',
            hide: 'block'
        })
        // const d_width = document.body.clientWidth;//浏览器的宽

        // const b_width = b_height / 3 * 4;//视频窗口的宽 4:3
        // const l_width = b_height / 9 * 16;//视频窗口的宽 16:9
        // const v_width = (d_width - 50) / 2;//视频窗口的宽
        // const d_height = v_width / 4 * 3;//视频窗口的高
        // const vs_width = (d_width - 50);//视频窗口的宽
        // const ds_height = (vs_width - 64 - 100) / 4 * 3;//视频窗口的高
        // if(c_height<ds_height){//浏览器的高小于视频窗口的高
        //     let x_height = c_height;
        //     let x_width = x_height / 3 * 4;
        //     set_width  = x_width;
        //     set_height  = x_height;
        // }else{
        //     set_width  = vs_width;
        //     set_height  = ds_height;
        // }
        // this.setState({
        //     set_width:set_width,
        //     set_height:set_height,
        //     show:'none',
        //     hide:'block'
        // })
    }
    shrink() {
        let set_width;
        let set_height;
        let no_Share_Stream_Wrap = document.getElementById('no_Share_Stream_Wrap');
        let share_Stream_Box = document.getElementById('share_Stream_Box');
        no_Share_Stream_Wrap.style.display = "block";
        share_Stream_Box.style.background = '#fff'
        let c_height = document.body.clientHeight / 5 * 4 - 64 - 40;//上半部分最大高度
        let d_width = document.body.clientWidth;//浏览器的宽
        let d_height = d_width / 4 * 3;//视频窗口的高
        let h_height = d_width / 16 * 9;//当前比例浏览器的高
        if (d_width / c_height > 16 / 9) {//宽高比大于16/9
            if (h_height > c_height) {
                let m_width = c_height / 9 * 16;
                console.log(m_width)
                set_width = m_width;
                set_height = c_height;
            } else {
                set_width = d_width;
                set_height = h_height;
            }
            console.log(d_width, h_height)
        } else if (d_width / c_height < 16 / 9 && d_width / c_height > 4 / 3) { //宽高比 16/9  4/3 的区间
            if (d_height > c_height) {
                let m_width = c_height / 3 * 4;
                set_width = m_width;
                set_height = c_height;
            } else {
                let m_height = d_width / 4 * 3;
                set_width = d_width;
                set_height = m_height;
            }
        } else if (d_width / c_height < 4 / 3) {//宽高比小于4/3
            set_width = d_width;
            set_height = d_height;
        }
        this.setState({
            set_width: set_width,
            set_height: set_height,
            show: 'block',
            hide: 'none'
        })
    }
    biggers() {
        let set_width;
        let set_height;
        let no_Share_Stream_Wrap = document.getElementById('no_Share_Stream_Wrap');
        console.log(no_Share_Stream_Wrap.style.display)
        if (no_Share_Stream_Wrap.style.display == 'block') {
            no_Share_Stream_Wrap.style.display = "none";
            const d_width = document.body.clientWidth;//浏览器的宽
            const c_height = document.body.clientHeight;//浏览器的高
            const b_height = (c_height - 50 - 64) / 2;//视频窗口的高
            const b_width = b_height / 3 * 4;//视频窗口的宽 4:3
            const l_width = b_height / 9 * 16;//视频窗口的宽 16:9
            const v_width = (d_width - 50) / 2;//视频窗口的宽
            const d_height = v_width / 4 * 3;//视频窗口的高
            const vs_width = (d_width - 50);//视频窗口的宽
            const ds_height = (vs_width - 64 - 100) / 4 * 3;//视频窗口的高
            if (c_height < ds_height) {//浏览器的高小于视频窗口的高
                let x_height = c_height;
                let x_width = x_height / 3 * 4;
                set_width = x_width;
                set_height = x_height;
            } else {
                set_width = vs_width;
                set_height = ds_height;
            }
            this.setState({
                set_width: set_width,
                set_height: set_height
            })
        } else if (no_Share_Stream_Wrap.style.display == 'none') {
            no_Share_Stream_Wrap.style.display = "block";
            let c_height = document.body.clientHeight / 5 * 4 - 64 - 40;//上半部分最大高度
            let d_width = document.body.clientWidth;//浏览器的宽
            let d_height = d_width / 4 * 3;//视频窗口的高
            let h_height = d_width / 16 * 9;//当前比例浏览器的高
            if (d_width / c_height > 16 / 9) {//宽高比大于16/9
                if (h_height > c_height) {
                    let m_width = c_height / 9 * 16;
                    console.log(m_width)
                    set_width = m_width;
                    set_height = c_height;
                } else {
                    set_width = d_width;
                    set_height = h_height;
                }
                console.log(d_width, h_height)
            } else if (d_width / c_height < 16 / 9 && d_width / c_height > 4 / 3) { //宽高比 16/9  4/3 的区间
                if (d_height > c_height) {
                    let m_width = c_height / 3 * 4;
                    set_width = m_width;
                    set_height = c_height;
                } else {
                    let m_height = d_width / 4 * 3;
                    set_width = d_width;
                    set_height = m_height;
                }
            } else if (d_width / c_height < 4 / 3) {//宽高比小于4/3
                set_width = d_width;
                set_height = d_height;
            }
            this.setState({
                set_width: set_width,
                set_height: set_height
            })
        }
        console.log(set_width, set_height)
    }
    render() {
        const { streams, startShare, shareingStream, shareingStreamId } = this.props;
        const { set_width, set_height } = this.state;
        console.log(set_width, set_height)
        if (startShare && shareingStream && shareingStreamId && streams[shareingStreamId]) {
            console.log('---------streams', streams);
            console.log('shareingStreamId==========', shareingStreamId);
            console.log('shareingStreamId==========streams[shareingStreamId]', streams[shareingStreamId]);
            console.log('shareingStreamId==========streams[shareingStreamId].stream', streams[shareingStreamId].stream);

            if (streams[shareingStreamId]) {
                if (streams[shareingStreamId].stream) {
                    if (streams[shareingStreamId].stream.id) {
                        var shareStreamBox = (<ShareStreamItem
                            stream={streams[shareingStreamId]}
                            id={streams[shareingStreamId].stream.id}
                            key={streams[shareingStreamId].stream.id}
                        />)
                        var streamBoxNoShare = Object.entries(streams).map(item => {
                            if (shareingStreamId != item[0]) {
                                let stream = item[1].stream;
                                if (!stream) {
                                    return console.log('error: no stream');
                                }
                                return (<ShareStreamItem
                                    stream={item[1]}
                                    width={this.state.x_width}
                                    height={this.state.x_height}
                                    id={stream.id}
                                    key={stream.id}
                                />);
                            }
                        })
                    }
                }

            }
        }
        return (
            <div className="share_Stream_Box" id="share_Stream_Box">
                <div className="share_Stream_Wrap" id="streamBox_share" style={{ width: this.state.set_width, height: this.state.set_height }}>
                    <div className="share_img" id="share_img">
                        <Icon type="arrows-alt" style={{ fontSize: '30px', cursor: 'pointer', display: this.state.show }} onClick={this.bigger} />
                        <Icon type="shrink" style={{ fontSize: '30px', cursor: 'pointer', color: '#fff', display: this.state.hide }} onClick={this.shrink} />
                    </div>

                    {shareStreamBox}
                </div>
                <div className="no_Share_Stream_Wrap" id="no_Share_Stream_Wrap">
                    <div className="wrap_just" id="wrap_just">
                        {streamBoxNoShare}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
    }
};

export default connect(mapStateToProps)(ShareStream);