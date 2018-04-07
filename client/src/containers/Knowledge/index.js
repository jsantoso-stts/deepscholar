import React, {Component} from 'react';
import {EntityDetail, BackToResult} from '../../components/index.js';
import {connect} from 'react-redux';
import Api from '../../api';
import './style.css';

class Knowledge extends Component {

  componentWillMount() {
    document.body.classList.add("knowledge-detail");
  }

  componentWillUnmount() {
    document.body.classList.remove("knowledge-detail");
  }

  componentDidMount() {
    
  }

  render() {

    const backBtn = this.props.history.length > 2 ? true : false;

    return (
      <div className="row">
        <div className="col s12">
          
          <EntityDetail backBtn={backBtn}/>
                    
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {state};
}

export default connect(mapStateToProps)(Knowledge);
