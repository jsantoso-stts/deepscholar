import React, {Component} from 'react';
import {EntityDetail} from '../../components/index.js';
import {connect} from 'react-redux';
import Api from '../../api';
import {requestEntity, receiveEntity} from '../../module';
import './style.css';

class Entity extends Component {

  componentWillMount() {
    document.body.classList.add("entities");
  }

  componentWillUnmount() {
    document.body.classList.remove("entities");
  }

  componentDidMount() {
    this.search(this.props.match.params.entityId);
  }

  search(entityId) {

    this.props.dispatch(requestEntity(entityId));
    
    const body = {
      query: {
        match: {
          _id: entityId
        }
      }
    };

    const {user} = this.props.state;
    const token = user ? user.token : null;

    Api.searchEntities({body})
      .then((json) => {
        this.props.dispatch(receiveEntity(json));
      });
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

export default connect(mapStateToProps)(Entity);
