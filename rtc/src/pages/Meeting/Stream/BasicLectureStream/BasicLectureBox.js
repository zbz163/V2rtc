import React, { Component } from 'react';
import { connect } from 'react-redux';
import StreamBox from './BasicLectureStream';
import _ from 'underscore';
import './BasicLectureBox.css';

class BasicLecture extends Component {
    constructor(props, context) {
        super(props, context);
        console.log(props)
    }
    // componentWillReceiveProps(nextProps){
    //     console.log(nextProps)
        
    //   }
    render() {
        const { speakerActiveIndex, streams, participant, remoteParticipants, lecturerId } = this.props;
        var mediaStreamId;
        var isLecturer = false;
        // if(streams && streams.length>0){
        console.error('============')
        if (participant && participant.streams) {
            //当前用户为主持人
            if (lecturerId == participant.id) {
                mediaStreamId = participant.streams.mediaStreamId;
                isLecturer = true;
            } else {
                //当前用户不是主持人
                for (var key in remoteParticipants) {
                    if (lecturerId == key) {
                        mediaStreamId = remoteParticipants[key].streams.mediaStreamId;
                    }
                }
            }
        }
        if (streams) {
            if (speakerActiveIndex === 0) {
                var renderStreams = Object.entries(streams).map(item => {
                    if (mediaStreamId == item[0]) {
                        let stream = item[1].stream;
                        if (!stream) {
                            return console.log('error: no stream');
                        }
                        return (<StreamBox
                            stream={item[1]}
                            id={stream.id}
                            key={stream.id}
                            speakerActiveIndex={speakerActiveIndex}
                        />);
                    }
                })
            } else if (speakerActiveIndex === 1) {
                if (streams[mediaStreamId]) {
                    let num = 0;
                    if (streams[mediaStreamId]) {
                        var lectureBox = (<StreamBox
                            stream={streams[mediaStreamId]}
                            id={streams[mediaStreamId].stream.id}
                            key={streams[mediaStreamId].stream.id}
                            speakerActiveIndex={speakerActiveIndex}
                        />)
                    }

                    var renderStreams1 = Object.entries(streams).map(item => {
                        console.log(streams,item)
                        if (mediaStreamId != item[0]) {
                            num = num + 1;
                            if (num > 1) {
                                return;
                            }
                            let stream = item[1].stream;
                            if (!stream) {
                                return console.log('error: no stream');
                            }
                            return (<StreamBox
                                stream={item[1]}
                                id={stream.id}
                                key={stream.id}
                                speakerActiveIndex={speakerActiveIndex}
                            />);
                        }
                    })

                    var renderStreams1_arr = _.filter(renderStreams1, (item) => { if (item !== "undefined") { return item } });
                    var renderStreams1_bottom = '';
                    if (renderStreams1_arr.length == 0) {
                        renderStreams1_bottom = <div></div>;
                    }
                }


            } else if (speakerActiveIndex === 2) {
                if (streams[mediaStreamId]) {
                    let num = 0;
                    var lectureBox2 = (<StreamBox
                        stream={streams[mediaStreamId]}
                        id={streams[mediaStreamId].stream.id}
                        key={streams[mediaStreamId].stream.id}
                        speakerActiveIndex={speakerActiveIndex}
                    />)
                    let num2_top = 0;
                    var renderStreams2_top = Object.entries(streams).map(item => {
                        if (mediaStreamId != item[0]) {
                            num2_top = num2_top + 1;
                            num = num + 1;
                            if (num > 1) {
                                return;
                            }
                            let stream = item[1].stream;
                            if (!stream) {
                                return console.log('error: no stream');
                            }
                            return (<StreamBox
                                stream={item[1]}
                                id={stream.id}
                                key={stream.id}
                                speakerActiveIndex={speakerActiveIndex}
                            />);
                        }
                    })
                    if (num2_top === 0) {
                        renderStreams2_top = <div> </div>
                    }
                    let num2_bottom = 0;
                    let num2_total = 0;
                    var renderStreams2_bottom = Object.entries(streams).map(item => {
                        if (mediaStreamId != item[0]) {

                            num2_total = num2_total + 1;
                            if (num2_total < 1) {
                                return;
                            }
                            if (num2_total > 1 && num2_total < 4) {
                                num2_bottom = num2_bottom + 1;
                                let stream = item[1].stream;
                                if (!stream) {
                                    return console.log('error: no stream');
                                }
                                return (<StreamBox
                                    stream={item[1]}
                                    id={stream.id}
                                    key={stream.id}
                                    speakerActiveIndex={speakerActiveIndex}
                                />);
                            }
                        }
                    })
                    var renderStreams2_bottom_arr = _.filter(renderStreams2_bottom, (item) => { if (item !== "undefined") { return item } });
                    var renderStreams2_bottom_push = '';
                    if (renderStreams2_bottom_arr.length == 0) {
                        renderStreams2_bottom_push = <div></div>;
                    }
                }

            } else if (speakerActiveIndex === 3) {
                if (streams[mediaStreamId]) {
                    var lectureBox3 = (<StreamBox
                        stream={streams[mediaStreamId]}
                        id={streams[mediaStreamId].stream.id}
                        key={streams[mediaStreamId].stream.id}
                        speakerActiveIndex={speakerActiveIndex}
                    />)
                    var renderStreams3_bottom = [];
                    let num3_bottom = 0;
                    var renderStreams3_bottom = Object.entries(streams).map(item => {
                        if (mediaStreamId != item[0]) {

                            num3_bottom = num3_bottom + 1;
                            if (num3_bottom < 5) {
                                let stream = item[1].stream;
                                if (!stream) {
                                    return console.log('error: no stream');
                                }
                                return (<StreamBox
                                    stream={item[1]}
                                    id={stream.id}
                                    key={stream.id}
                                    speakerActiveIndex={speakerActiveIndex}
                                />);
                            } else {
                                return;
                            }
                        }
                    })
                    var renderStreams3_bottom_arr = _.filter(renderStreams3_bottom, (item) => { if (item !== "undefined") { return item } });

                    var renderStreams3_bottom_push = Array.apply(renderStreams3_bottom_arr, Array(4 - renderStreams3_bottom_arr.length)).map((item, i) => <div key={i}></div>);
                }
            } else if (speakerActiveIndex === 4) {
                if (streams[mediaStreamId]) {
                    var lectureBox4 = (<StreamBox
                        stream={streams[mediaStreamId]}
                        id={streams[mediaStreamId].stream.id}
                        key={streams[mediaStreamId].stream.id}
                        speakerActiveIndex={speakerActiveIndex}
                    />)
                    var num4_right = 0;
                    var renderStreams4_right = Object.entries(streams).map(item => {
                        if (mediaStreamId != item[0]) {

                            num4_right = num4_right + 1;
                            if (num4_right < 2) {
                                let stream = item[1].stream;
                                if (!stream) {
                                    return console.log('error: no stream');
                                }
                                return (<StreamBox
                                    stream={item[1]}
                                    id={stream.id}
                                    key={stream.id}
                                    speakerActiveIndex={speakerActiveIndex}
                                />);
                            } else {
                                return;
                            }
                        }
                    })
                    var renderStreams4_right_arr = _.filter(renderStreams4_right, (item) => { if (item !== "undefined") { return item } });
                    var renderStreams4_right_push = Array.apply(renderStreams4_right_arr, Array(1 - renderStreams4_right_arr.length)).map((item, i) => <div key={i}> </div>);
                    var num4_bottom = 0;
                    var renderStreams4_bottom = Object.entries(streams).map(item => {
                        if (mediaStreamId != item[0]) {

                            num4_bottom = num4_bottom + 1;
                            if (num4_bottom > 1 && num4_bottom < 6) {
                                let stream = item[1].stream;
                                if (!stream) {
                                    return console.log('error: no stream');
                                }
                                return (<StreamBox
                                    stream={item[1]}
                                    id={stream.id}
                                    key={stream.id}
                                    speakerActiveIndex={speakerActiveIndex}
                                />);
                            } else {
                                return;
                            }
                        }
                    })
                    var renderStreams4_bottom_arr = _.filter(renderStreams4_bottom, (item) => { if (item !== "undefined") { return item } });
                    var renderStreams4_bottom_push = Array.apply(renderStreams4_bottom_arr, Array(4 - renderStreams4_bottom_arr.length)).map((item, i) => <div key={i}> </div>);
                }

            } else if (speakerActiveIndex === 5) {
                if (streams[mediaStreamId]) {
                    if (streams[mediaStreamId].stream.id) {
                        var lectureBox5 = (<StreamBox
                            stream={streams[mediaStreamId]}
                            id={streams[mediaStreamId].stream.id}
                            key={streams[mediaStreamId].stream.id}
                            speakerActiveIndex={speakerActiveIndex}
                        />)
                        var num5_top_right = 0;
                        var renderStreams5_top_right = Object.entries(streams).map(item => {
                            if (mediaStreamId != item[0]) {

                                num5_top_right = num5_top_right + 1;
                                if (num5_top_right < 2) {
                                    let stream = item[1].stream;
                                    if (!stream) {
                                        return console.log('error: no stream');
                                    }
                                    return (<StreamBox
                                        stream={item[1]}
                                        id={stream.id}
                                        key={stream.id}
                                        speakerActiveIndex={speakerActiveIndex}
                                    />);
                                } else {
                                    return;
                                }
                            }
                        })
                        var renderStreams5_top_right_arr = _.filter(renderStreams5_top_right, (item) => { if (item !== "undefined") { return item } });

                        var renderStreams5_top_right_push = Array.apply(renderStreams5_top_right_arr, Array(1 - renderStreams5_top_right_arr.length)).map((item, i) => <div key={i}> </div>);

                        var num5_middle = 0;
                        var renderStreams5_middle = Object.entries(streams).map(item => {
                            if (mediaStreamId != item[0]) {

                                num5_middle = num5_middle + 1;
                                if (num5_middle > 1 && num5_middle < 4) {
                                    let stream = item[1].stream;
                                    if (!stream) {
                                        return console.log('error: no stream');
                                    }
                                    return (<StreamBox
                                        stream={item[1]}
                                        id={stream.id}
                                        key={stream.id}
                                        speakerActiveIndex={speakerActiveIndex}
                                    />);
                                } else {
                                    return;
                                }
                            }
                        })
                        var renderStreams5_middle_arr = _.filter(renderStreams5_middle, (item) => { if (item !== "undefined") { return item } });

                        var renderStreams5_middle_push = Array.apply(renderStreams5_middle_arr, Array(2 - renderStreams5_middle_arr.length)).map((item, i) => <div key={i}> </div>);

                        var num5_bottom = 0;
                        var renderStreams5_bottom = Object.entries(streams).map(item => {
                            if (mediaStreamId != item[0]) {

                                num5_bottom = num5_bottom + 1;
                                if (num5_bottom > 3 && num5_bottom < 8) {
                                    let stream = item[1].stream;
                                    if (!stream) {
                                        return console.log('error: no stream');
                                    }
                                    return (<StreamBox
                                        stream={item[1]}
                                        id={stream.id}
                                        key={stream.id}
                                        speakerActiveIndex={speakerActiveIndex}
                                    />);
                                } else {
                                    return;
                                }
                            }
                        })
                        var renderStreams5_bottom_arr = _.filter(renderStreams5_bottom, (item) => { if (item !== "undefined") { return item } });

                        var renderStreams5_bottom_push = Array.apply(renderStreams5_bottom, Array(4 - renderStreams5_bottom_arr.length)).map((item, i) => <div key={i}> </div>);

                    }

                }

            }
        }

        return (

            <div className="speaker_Show" >
                <div className={"speaker_oneShow speaker_box " + (speakerActiveIndex === 0 ? 'speaker_active' : '')}>
                    <div className={" meeting " + (speakerActiveIndex === 0 ? 'speaker_active' : '')} >
                        {renderStreams}
                    </div>
                </div>
                <div className={"speaker_twoShow speaker_box " + (speakerActiveIndex === 1 ? 'speaker_active' : '')}>
                    <div>
                        {lectureBox}
                        {renderStreams1}
                        {renderStreams1_bottom}
                    </div>
                </div>
                <div className={"speaker_threeShow speaker_box " + (speakerActiveIndex === 2 ? 'speaker_active' : '')}>
                    <div>
                        {lectureBox2}
                        {renderStreams2_top}
                    </div>
                    <div>
                        {renderStreams2_bottom}
                        {renderStreams2_bottom_push}
                        {renderStreams2_bottom_push}
                    </div>
                </div>
                <div className={"speaker_fourShow speaker_box " + (speakerActiveIndex === 3 ? 'speaker_active' : '')}>
                    {lectureBox3}
                    <div>
                        {renderStreams3_bottom}
                        {renderStreams3_bottom_push}
                    </div>
                </div>
                <div className={"speaker_fiveShow speaker_box " + (speakerActiveIndex === 4 ? 'speaker_active' : '')}>
                    <div>
                        {lectureBox4}
                        {renderStreams4_right}
                        {renderStreams4_right_push}
                    </div>
                    <div>
                        {renderStreams4_bottom}
                        {renderStreams4_bottom_push}
                    </div>
                </div>
                <div className={"speaker_sixShow speaker_box " + (speakerActiveIndex === 5 ? 'speaker_active' : '')}>
                    <div>
                        {lectureBox5}
                        {renderStreams5_top_right}
                        {renderStreams5_top_right_push}
                    </div>
                    <div>
                        {renderStreams5_middle}
                        {renderStreams5_middle_push}
                    </div>
                    <div>
                        {renderStreams5_bottom}
                        {renderStreams5_bottom_push}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    console.log(state)
    return {
        streams: state.teevid.meeting.streams,
        storyboard: state.teevid.api.storyboard,
        participant: state.teevid.meeting.participant,
        localStreamId: state.teevid.meeting.localStreamId,
        lecturerId: state.teevid.meeting.lecturerId,
        remoteParticipants: state.teevid.meeting.remoteParticipants,
        speakerActiveIndex: state.teevid.meeting.lectureLayout,
    }
};

export default connect(mapStateToProps)(BasicLecture);