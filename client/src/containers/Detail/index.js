import React, {Component} from 'react';
import {Paper, BackToResult} from '../../components/index.js';
import {connect} from 'react-redux';
import Api from '../../api';
import {requestPaper, receivePaper} from '../../module';
import './style.css';

class Detail extends Component {

  componentWillMount() {
    document.body.classList.add("detail");
  }

  componentWillUnmount() {
    document.body.classList.remove("detail");
  }

  componentDidMount() {
    this.search(this.props.match.params.paperId);
  }

  search(paperId) {
    this.props.dispatch(requestPaper(paperId));
    const body = {
      query: {
        match: {
          _id: paperId
        }
      }
    };
    Api.searchText({body})
      .then((json) => {
        this.props.dispatch(receivePaper(json));
      });
  }

  render() {
    const {paper} = this.props.state;

    return (
      <div className="row">
        <div className="col s12">
          {this.props.history.length > 2 &&
            <BackToResult/>
          }
          {paper !== null &&
          <Paper data={paper} asFull={true}/>
          }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {state};
}

export default connect(mapStateToProps)(Detail);
