import React, {Component} from 'react';
import _ from 'lodash';
import {
  BrowserRouter, Switch, Route, Link
} from 'react-router-dom';
import {connect} from 'react-redux';
import Index from '../Index/index.js';
import Search from '../Search/index.js';
import Detail from '../Detail/index.js';
import Knowledge from '../Knowledge/index.js';
import Profile from '../Profile/index.js';
import {ScrollToTop} from '../../components/index.js';
import {
  changeQuery,
  deleteAllScrollY,
  signedIn,
  signedOut,
  getLabelList,
  updateLabelList,
  favoriteKey, requestImportIndexes, receiveImportIndexes
} from '../../module';
import './materializeTheme.css';
import './style.css';
import Api from '../../api';

function mapStateToProps(state) {
  return {state};
}

const NavBar = connect(mapStateToProps)(class NavBar extends Component {
  static TOKEN_STORE_KEY = "token";

  constructor(props) {
    super(props);
    this.searchTimer = null;
    this.query = null;
    this.fileElement = null;
  }

  componentDidMount() {

    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin || event.data.type !== "authenticated") {
        return;
      }

      const user = event.data.user;
      this.signIn(user);
      this.props.dispatch(getLabelList());
      this.props.dispatch(changeQuery(this.props.state.category, this.query));
    });

    const token = window.localStorage.getItem(NavBar.TOKEN_STORE_KEY);
    if (token) {
      Api.verify(token)
        .then(user => {
          this.signIn(user);
        })
        .catch(() => {
          window.localStorage.removeItem(NavBar.TOKEN_STORE_KEY);
          this.props.dispatch(signedOut());
        });
    }

    this.props.dispatch(getLabelList());

    this.query = this.props.state.query;
  }

  signIn(user) {
    window.localStorage.setItem(NavBar.TOKEN_STORE_KEY, user.token);
    this.props.dispatch(signedIn(user));
  }

  componentDidUpdate(prevProps) {
    window.jQuery(".dropdown-trigger")
      .dropdown();

    const {category: oldCategory, query: oldQuery, gte: oldGte, lte: oldLte, page: oldPage, labelFilter: oldlabelFilter} = prevProps.state;
    const {category: newCategory, query: newQuery, gte: newGte, lte: newLte, page: newPage, labelFilter: newlabelFilter} = this.props.state;

    if (oldCategory === newCategory && oldQuery === newQuery && oldPage === newPage && oldGte === newGte && oldLte === newLte && oldlabelFilter === newlabelFilter) {
      return;
    }

    const queries = [];
    if (newQuery !== null) {
      queries.push([
        "q",
        newQuery
      ]);
    }
    if (newPage !== null) {
      queries.push([
        "page",
        newPage + 1
      ]);
    }
    if (newGte !== null) {
      queries.push([
        "gte",
        newGte
      ]);
    }
    if (newLte !== null) {
      queries.push([
        "lte",
        newLte
      ]);
    }

    const queryString = queries.map(query => {
      return `${query[0]}=${query[1]}`;
    })
      .join("&");

    const newUrl = `/${newCategory}?${queryString}`;
    const oldUrl = this.props.location.pathname + this.props.location.search;

    if (newUrl !== oldUrl) {
      this.props.history.push(newUrl);
    }

    this.query = newQuery;

    this.refs.search.value = this.props.state.query !== null ? decodeURIComponent(this.props.state.query) : '';
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.searchTimer !== null) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    this.searchTimer = setTimeout(() => {
      this.props.dispatch(deleteAllScrollY());

      const labelFilter = this.props.state.labelFilter.slice();
      _.remove(labelFilter, n => {
        return n === favoriteKey;
      });

      this.props.dispatch(changeQuery(this.props.state.category, this.query, labelFilter));
    }, 0);
  }

  handleChange(e) {
    this.query = e.target.value;
  }

  handleClickSignIn(e) {
    e.preventDefault();
    window.open('/api/auth/github');
  }

  handleClickSignOut(e) {
    e.preventDefault();

    const {labelList} = this.props.state;
    this.props.dispatch(updateLabelList(labelList));

    window.localStorage.removeItem(NavBar.TOKEN_STORE_KEY);
    this.props.dispatch(signedOut());
  }

  handleClickImportIndexes() {
    this.fileElement.click();
  }

  handleClickInitializePapers() {
    if (!window.confirm("Are you sure to initialize papers? Your browser will be reloaded.")) {
      return;
    }

    const {user} = this.props.state;
    const token = user ? user.token : null;

    Api.initializePapers(token)
      .then(() => window.location.reload())
      .catch(console.log);
  }

  handleChangeFile(e) {
    if (!window.confirm("Are you sure to import indexes?")) {
      return;
    }

    this.props.dispatch(requestImportIndexes());

    const {user} = this.props.state;
    const token = user ? user.token : null;

    const target = e.target;
    const file = target.files.item(0);
    Api.importPapers(token, file)
      .then(() => {
        window.Materialize.toast('The file had been uploaded. Now papers have been creating.', 5000);
        this.props.dispatch(receiveImportIndexes());
      })
      .catch(console.log);
  }

  render() {
    const {user, isUploading} = this.props.state;
    const isSignedIn = user !== null;
    const isAdmin = user && user.isAdmin === true;

    const src = user ? user.profile.photos[0].value : null;

    return (
      <div className="navbar-fixed">
        <nav className="header-navi z-depth-0">
          <div className="nav-wrapper">
            <div className="row">
              <div className="col s4 l3">
                <Link to="/" className="brand-logo"><img src="/images/deepscholar_logo_circle.svg"/></Link>
              </div>
              <div className="col s7 l6">
                <div className="input-field input-field--search">
                  <form onSubmit={this.handleSubmit.bind(this)}>
                    <input type="search" placeholder="Search" ref="search" onChange={this.handleChange.bind(this)}
                           defaultValue={this.props.state.query}/>
                  </form>
                  <label className="label-icon" htmlFor="search"><i className="material-icons">search</i>
                  </label>
                </div>
              </div>
              <ul id="navMenu" className="dropdown-content">
                <li><a href="#!" onClick={this.handleClickImportIndexes.bind(this)}>Import Papers</a></li>
                <li className="divider"></li>
                <li><a href="#!" onClick={this.handleClickInitializePapers.bind(this)}>Initialize Papers</a></li>
              </ul>
              <ul className="right">
                {isUploading &&
                <li className="valign-wrapper preloader-container">
                  <div className="preloader-wrapper small active">
                    <div className="spinner-layer spinner-blue-only">
                      <div className="circle-clipper left">
                        <div className="circle"></div>
                      </div>
                      <div className="gap-patch">
                        <div className="circle"></div>
                      </div>
                      <div className="circle-clipper right">
                        <div className="circle"></div>
                      </div>
                    </div>
                  </div>
                </li>
                }
                {!isUploading && isSignedIn && isAdmin &&
                <li><a className="dropdown-trigger" href="#!" data-beloworigin="true" data-activates="navMenu">Menu<i
                  className="material-icons right">arrow_drop_down</i></a></li>
                }
                {!isUploading && isSignedIn && isAdmin &&
                <input type="file" onChange={this.handleChangeFile.bind(this)} ref={input => {
                  this.fileElement = input;
                  return input;
                }}/>
                }
                {!isSignedIn &&
                <li><a href="#" onClick={this.handleClickSignIn.bind(this)}>Sign in</a></li>
                }
                {isSignedIn &&
                <li><a href="#" className="tooltipped" data-position="bottom" data-delay="50"
                       data-tooltip={user.profile.username} onClick={this.handleClickSignOut.bind(this)}><img
                  className="avatar" src={src}/>Sign out</a></li>
                }
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
});

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route component={props =>
            <NavBar {...props}/>
          }/>
          <div className="container">
            <div>
              <Switch>
                <Route exact path="/papers/:paperId" component={Detail}/>
                <Route exact path="/knowledge/:entityId" component={Knowledge}/>
                <Route exact path="/" component={props =>
                  <Index {...props}/>
                }/>
                <Route exact path="/profile" component={Profile}/>
                <Route component={props =>
                  <ScrollToTop {...props}>
                    <Search {...props}/>
                  </ScrollToTop>
                }/>
              </Switch>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
