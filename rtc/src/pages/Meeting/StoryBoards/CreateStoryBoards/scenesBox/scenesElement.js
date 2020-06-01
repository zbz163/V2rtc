import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import * as actions from './action.js';

class ScenesElement extends React.Component {
    constructor(props, context) {
        super(...arguments);
        // this.showStory = this.showStory.bind(this);
    }

    render() {
        // const {_id, title, completed, scenes,thumbnail } = this.props;
        let { Item } = this.props;
        console.log('=======Item',Item)
        // let elements = [];
        // if(Item && Item.elements){
        //     elements = Item.elements;
        // }
        return (
            <div className={"streamBox scenes"} style={{ height: `${Item.style.height} || auto`, width: `${Item.style.width}`, position: 'absolute', top: `${Item.position.top}%`, left: `${Item.position.left}%` }}>

                {Item.contentType === "video" && !Item.hidden && <div
                    className='streamImg' style={{ background: "red", height: `${Item.style.height}`, width: `${Item.style.width}`, position: 'relative', zIndex: `Item.position.index` }}
                >
                </div>}
                {Item.contentType === "text" && <p className="scene-wrapper__text__font_size__50 scene-wrapper__text__alignment__center" type="text" style={{ height: `${Item.style.height}`, width: `${Item.style.width}`, position: 'relative', zIndex: `Item.position.index` }}>{Item.content} </p>}
                {Item.contentType === "image" && <img src={Item.content} alt="" style={{ height: `${Item.style.height}`, width: `${Item.style.width}`, position: 'relative', zIndex: `Item.position.index` }} />}
            </div>
        );
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
    }
}
const mapStateToProps = (state) => {
    return {
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ScenesElement);