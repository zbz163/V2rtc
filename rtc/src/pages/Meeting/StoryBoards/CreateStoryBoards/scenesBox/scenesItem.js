import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import * as actions from './action.js';
import ScenesElement from './scenesElement';
import './scenesItem.css';
class ScenesItem extends React.Component {
    constructor(props, context) {
        super(...arguments);
        // this.showStory = this.showStory.bind(this);
    }

    render() {
        // const {_id, title, completed, scenes,thumbnail } = this.props;
        let { scenesItem } = this.props;
        let elements = [];
        if (scenesItem && scenesItem.elements) {
            elements = scenesItem.elements;
        }
        console.log('=========elements', elements)
        return (
            <div className="contentScenes">
                <div className="content_title">{scenesItem.title}</div>
                <div className="content_jia scenes" onClick={this.createScenes} style={{ position: "relative" }}>
                    {elements.length > 0 &&
                        <ul>
                            {
                                elements.map((item) => (
                                    <ScenesElement key={item._id} Item={item} />
                                ))
                            }
                        </ul>
                    }
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ScenesItem);