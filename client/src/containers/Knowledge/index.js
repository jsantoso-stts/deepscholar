import React, {Component} from 'react';
import {EntityDetail} from '../../components/index.js';
import {connect} from 'react-redux';
import {receiveEntity} from '../../module';
import './style.css';

class Knowledge extends Component {

  componentWillMount() {
    document.body.classList.add("knowledge-detail");
  }

  componentWillUnmount() {
    document.body.classList.remove("knowledge-detail");
  }

  componentDidMount() {
    this.search(this.props.match.params.entityId);
  }

  search(entityId) {
    //   this.props.dispatch(requestPaper(entityId));
    //   const body = {
    //     query: {
    //       match: {
    //         _id: entityId
    //       }
    //     }
    //   };
    // sample data
    const sampleJson = {
      hits: {
        hits: [
          {
            id: "1",
            title: "Deep Learning",
            desc: "branch of machine learning",
            properties: {
              "Property A": [
                "Select Value A-1",
                "Select Value A-2",
                "Select Value A-3",
                "Select Value A-4",
                "Select Value A-5",
                "Select Value A-6"
              ],
              "Property B": ["Select Value B-1"],
              "Property C": []
            },
            update: 1523709809
          },
          {
            id: "2",
            title: "Learning TensorFlow: A Guide to Building Deep learning Systems",
            desc: "Nature article by LeCun, Bengio and Hinton",
            properties: {
              "Property A": [
                "Select Value A-1",
                "Select Value A-2",
                "Select Value A-3",
                "Select Value A-4",
                "Select Value A-5"
              ],
              "Property B": ["Select Value B-1"],
              "Property C": []
            },
            update: 1523709809
          },
          {
            id: "3",
            title: "Human-level control through deep reinforcement learning",
            desc: "scientific article",
            properties: {
              "Property A": [
                "Select Value A-1",
                "Select Value A-2",
                "Select Value A-3",
                "Select Value A-4",
                "Select Value A-5"
              ],
              "Property B": ["Select Value B-1"],
              "Property C": []
            },
            update: 1523709809
          },
          {
            id: "4",
            title: "IMS at EmoInt-2017: Emotion Intensity Prediction with Affective Norms, Automatically Extended Resources and Deep Learning",
            desc: "scientific article (publication date: May 2016)",
            properties: {
              "Property A": [
                "Select Value A-1",
                "Select Value A-2",
                "Select Value A-3"
              ],
              "Property B": ["Select Value B-1"],
              "Property C": []
            },
            update: 1523709809
          },
          {
            id: "5",
            title: "Unsupervised Deep Learning Applied to Breast Density Segmentation and Mammographic Risk Scoring",
            desc: "Deep Learning Supercomputer System",
            properties: {
              "Property A": [
                "Select Value A-1",
                "Select Value A-2",
                "Select Value A-3"
              ],
              "Property B": ["Select Value B-1"],
              "Property C": []
            },
            update: 1523709809
          }
        ],
        total: 5
      }
    };

    const index = entityId - 1;

    const json = {
      hits: {
        hits: [
          sampleJson.hits.hits[index]
        ],
        total: 1
      }
    }
    //   Api.searchText({body})
    //     .then((json) => {
    //       this.props.dispatch(receivePaper(json));
    //     });
    this.props.dispatch(receiveEntity(json));
  }

  render() {
    const {entity} = this.props.state;
    const backBtn = this.props.history.length > 2;

    return (
      <div className="row">
        <div className="col s12">

          <EntityDetail data={entity} backBtn={backBtn}/>

        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {state};
}

export default connect(mapStateToProps)(Knowledge);
