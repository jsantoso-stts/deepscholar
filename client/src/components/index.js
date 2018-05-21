import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import './style.css';
import {saveScrollY, toggleAllAuthors, toggleAbstract, updateLabelList, favoriteKey, editEntity, addEntity, removeEntity, saveEntity} from "../module";

function mapStateToProps(state) {
  return {state};
}

const AllAuthorsToggle = connect(mapStateToProps)(class AllAuthorsToggle extends Component {
  handleClick() {
    this.props.dispatch(toggleAllAuthors(this.props.paperId));
  }

  render() {
    const isAllAuthorsEnabled = this.props.state.enabledAllAuthorsPaperIds.has(this.props.paperId);
    const label = isAllAuthorsEnabled ? "Less" : "More";
    const prefix = isAllAuthorsEnabled ? "" : "...";
    return (
      <span>
        {prefix}<a href="javascript:void(0)" onClick={this.handleClick.bind(this)}>({label})</a>
      </span>
    );
  }
});

const Authors = connect(mapStateToProps)(class Authors extends Component {
  render() {
    let data = this.props.data;
    if (!this.props.asFull && !this.props.state.enabledAllAuthorsPaperIds.has(this.props.paperId)) {
      data = this.props.data.slice(0, 3);
    }
    const highlightedAuthors = this.props.highlight.authors || [];

    const authors = data.map((author, i) => {
      let name = author;
      for (const highlightedAuthor of highlightedAuthors) {
        if (highlightedAuthor.replace(/<\/?em>/g, "") === author) {
          name = highlightedAuthor;
          break;
        }
      }
      const sepatate = data.length !== i + 1 ? ',' : '';
      const label = {__html: `${name}${sepatate}`};
      return <li key={author} dangerouslySetInnerHTML={label}></li>;
    });
    const haveMore = this.props.data.length > 3;

    return (
      <ul className="meta authors">
        {authors}{!this.props.asFull && haveMore && <AllAuthorsToggle paperId={this.props.paperId}/>}
      </ul>
    );
  }
});

const AbstractToggle = connect(mapStateToProps)(class AbstractToggle extends Component {
  handleClick() {
    this.props.dispatch(toggleAbstract(this.props.paperId));
  }

  render() {

    const icon = this.props.enable ? "▼" : "▲";
    return (
      <li>
        <a className="abstractToggle" href="javascript:void(0)" onClick={this.handleClick.bind(this)}><span>{icon}</span>abstract</a>
      </li>
    );
  }
});

const CheckForFilter = connect(mapStateToProps)(class CheckBoxForFilter extends Component {

  handleChange() {
    const target = document.querySelector('.toolBar');
    if (document.querySelectorAll('.paper input:checked').length > 0) {
      target.classList.add('choosing');
    } else {
      target.classList.remove('choosing');
    }
  }

  render() {
    const id = this.props.id;
    return (
      <div className="checkbox">
        <input type="checkbox" id={id} className="filled-in" onChange={this.handleChange.bind(this)}/>
        <label htmlFor={id}></label>
      </div>
    );
  }
});

const Favorite = connect(mapStateToProps)(class CheckBoxForFilter extends Component {

  handleClick(e) {

    const labelList = Object.assign({}, this.props.state.labelList);
    const targetKey = this.props.state.category === 'knowledge' ? 'entity' : 'paper';

    const favList = labelList[favoriteKey][targetKey];
    const id = e.currentTarget.dataset.id;
    const index = labelList[favoriteKey][targetKey].indexOf(id);
    // exist ? remove : add;
    if (index !== -1) {
      favList.splice(index, 1);
    } else {
      favList.push(id);
    }
    this.props.dispatch(updateLabelList(labelList));
  }

  render() {
    const id = this.props.id;
    return (
      <div className="favorite" data-id={id} onClick={this.handleClick.bind(this)}>
        <i className="material-icons on">star</i>
        <i className="material-icons off">star_border</i>
      </div>
    );
  }
});

const FilterLabels = connect(mapStateToProps)(class FilterLabels extends Component {

  render() {
    const {labelList} = this.props.state;
    const labels = Object.keys(labelList)
      .map(key => {
        const labelKey = key;
        if (labelKey !== favoriteKey) {
          return <span key={key} className={`${key} ${labelList[labelKey][1]}`}></span>;
        }

        return null;
      });

    return (
      <span className="filterLabels">
        {labels}
      </span>
    );
  }
});

export const Paper = withRouter(connect(mapStateToProps)(class Paper extends Component {

  handleClick(paperUrl) {
    this.props.dispatch(saveScrollY(this.props.location.key, window.scrollY));
    this.props.history.push(paperUrl);
  }

  render() {
    const id = this.props.data._id;
    const {year, abstract: rawAbstract, articleTitle: rawArticleTitle, journalTitle: rawJournalTitle, authors, pdf, xml, pdftxt} = this.props.data._source;
    const highlight = this.props.data.highlight || {};
    const {abstract: highlightedAbstract, articleTitle: highlightedArticleTitle, journalTitle: highlightedJournalTitle} = highlight;
    const paperUrl = `/papers/${id}`;
    const authorComponents = <Authors data={authors} highlight={highlight} paperId={id} asFull={this.props.asFull}/>;

    const {user} = this.props.state;
    const pdfannoParams = {
      api_root: `${window.location.origin}/api`,
      document_id: id
    };
    if (user) {
      pdfannoParams.user_id = user.id;
      pdfannoParams.user_token = user.token;
    }
    const pdfannoQueryParams = Object.entries(pdfannoParams).map(value => {
      return `${value[0]}=${value[1]}`;
    })
      .join("&");
    const pdfannoUrl = `${process.env.REACT_APP_PDFANNO_URL}?${pdfannoQueryParams}`;

    const articleTitle = {__html: highlightedArticleTitle || rawArticleTitle};
    const journalTitle = {__html: `${highlightedJournalTitle || rawJournalTitle}, ${year}`};

    const abstractTxt = (highlightedAbstract ? highlightedAbstract[0] : rawAbstract) || "";

    const abstractHtml = {__html: abstractTxt};

    const enableAbstract = this.props.state.enabledFullAbstractPaperIds.has(id);

    const abstract = enableAbstract || this.props.asFull ? <div className="abstract" dangerouslySetInnerHTML={abstractHtml}></div> : null;

    const abstractToggle = this.props.asFull !== true ? <AbstractToggle paperId={id} enable={enableAbstract} /> : null;

    return (
      <article className={`paper paper${id}`}>
        <div className="divider"></div>
        <CheckForFilter id={id}/>
        <Favorite id={id}/>

        <header>
          <h5>
            <a href="javascript:void(0)" onClick={this.handleClick.bind(this, paperUrl)}
               dangerouslySetInnerHTML={articleTitle}></a>
            <FilterLabels />
          </h5>
          {authorComponents}
          <h6 dangerouslySetInnerHTML={journalTitle}></h6>
        </header>

        <footer>
          <ul className="meta links valign-wrapper blue-text">
            {abstractToggle}
            <li>
              <a href={pdf} target="_blank">pdf</a>
            </li>
            <li>
              <a href={xml} target="_blank">xml</a>
            </li>
            <li>
              <a href={pdftxt} target="_blank">pdf.txt</a>
            </li>
            <li><a href={pdfannoUrl} target="_blank">pdfanno</a></li>
          </ul>
        </footer>

        {abstract}

      </article>
    );
  }
}));

export class Papers extends Component {
  render() {
    const papers = this.props.data.map((paper) =>
      <Paper data={paper} key={paper._id} asFull={false}/>
    );

    return (
      <div>
        {papers}
      </div>
    );
  }
}

export const Figure = withRouter(connect(mapStateToProps)(class Figure extends Component {
  handleClick(paperUrl) {
    this.props.dispatch(saveScrollY(this.props.location.key, window.scrollY));
    this.props.history.push(paperUrl);
  }

  render() {
    const {img: url, label, caption} = this.props.data._source;
    const paper = this.props.data.inner_hits.text.hits.hits[0];
    const paperId = paper._id;
    const {articleTitle} = paper._source;
    const paperUrl = `/papers/${paperId}`;
    const footer = `${label} ${caption}`;

    return (
      <article className="figure">
        <div className="divider"></div>
        <header>
          <h5><a href="javascript:void(0)" onClick={this.handleClick.bind(this, paperUrl)}>{articleTitle}</a></h5>
        </header>
        <a className="figure-image" key={url} href={url}>
          <img src={url}/>
        </a>
        <footer>
          <h6>{footer}</h6>
        </footer>
      </article>
    );
  }
}));

export class Figures extends Component {
  componentDidUpdate() {
    const element = document.getElementById('figures');
    const lgUid = element.getAttribute('lg-uid');
    if (lgUid) {
      try {
        window.lgData[lgUid].destroy(true);
      } catch (error) {
        console.error(error);
      }
    }
  }

  componentDidMount() {
    window.lightGallery(document.getElementById('figures'), {
      selector: ".figure-image"
    });
  }

  render() {
    const figures = this.props.data.map((value, i) => {
      return <Figure key={i} data={value}/>;
    });

    return (
      <div id="figures">
        {figures}
      </div>
    );
  }
}

export const Table = withRouter(connect(mapStateToProps)(class Table extends Component {
  handleClick(paperUrl) {
    this.props.dispatch(saveScrollY(this.props.location.key, window.scrollY));
    this.props.history.push(paperUrl);
  }

  render() {
    const {img: url, label, caption} = this.props.data._source;
    const paper = this.props.data.inner_hits.text.hits.hits[0];
    const paperId = paper._id;
    const {articleTitle} = paper._source;
    const paperUrl = `/papers/${paperId}`;
    const footer = `${label} ${caption}`;

    return (
      <article className="table">
        <div className="divider"></div>
        <header>
          <h5><a href="javascript:void(0)" onClick={this.handleClick.bind(this, paperUrl)}>{articleTitle}</a></h5>
        </header>
        <img src={url}/>
        <footer>
          <h6>{footer}</h6>
        </footer>
      </article>
    );
  }
}));

export class Tables extends Component {
  render() {
    const tables = this.props.data.map((value, i) => {
      return <Table key={i} data={value}/>;
    });

    return (
      <div id="tables">
        {tables}
      </div>
    );
  }
}

const EntityDetailProp = connect(mapStateToProps)(class EntityDetailProp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      valueOld: this.props.value || ""
    };
  }

  componentDidMount() {
    const self = this;
    window.jQuery(this.refs.select).on('change', event => {
      self.handleChange(event);
    })
    .material_select();
  }

  switchEditMode(bool) {
    const node = ReactDOM.findDOMNode(this.refs.thisElem);
    if (bool) {
      node.classList.add('edit');
    } else {
      node.classList.remove('edit');
    }
  }

  handleClickEdit() {
    let value;
    const category = this.props.category;
    const index = this.props.index;
    if (index) {
      value = this.props.state.entity._source[category][index];      
    } else {
      value = this.props.state.entity._source[category];
    }
    this.setState({valueOld: value});
    this.switchEditMode(true);
  }

  handleClickRemove() {
    const category = this.props.category;
    const index = this.props.index;
    this.props.dispatch(removeEntity(category, index));
  }

  handleClickFinish() {
    this.switchEditMode(false);
    const entity = this.props.state.entity;
    this.props.dispatch(saveEntity(entity));
  }

  handleClickCancel() {
    const entity = Object.assign({}, this.props.state.entity);
    const category = this.props.category;
    const index = this.props.index;

    if (index) {
      entity._source[category][index] = this.state.valueOld;      
    } else {
      entity._source[category] = this.state.valueOld;
    }

    this.props.dispatch(editEntity(entity));
    this.switchEditMode(false);
  }

  handleChange(event) {
    const entity = Object.assign({}, this.props.state.entity);
    const category = this.props.category;
    const index = this.props.index;

    if (index) {
      entity._source[category][index] = event.target.value;      
    } else {
      entity._source[category] = event.target.value;
    }

    this.props.dispatch(editEntity(entity));
  }

  render() {

    let value;
    const category = this.props.category;
    const index = this.props.index;
    if (index) {
      value = this.props.state.entity._source[category][index];      
    } else {
      value = this.props.state.entity._source[category];
    }

    return (
      <div ref="thisElem" className="box-row">

        <p>{value}</p>

        <div className="editBtns">
          <a className="icon edit" href="javascript:void(0)" onClick={this.handleClickEdit.bind(this)}><i className="material-icons">edit</i></a>
          <a className="icon delete" href="javascript:void(0)" onClick={this.handleClickRemove.bind(this)}><i className="material-icons">delete_forever</i></a>
        </div>

        <div className="input-field input-field--alpha">
          <input type="text" value={value} onChange={this.handleChange.bind(this)}/>
        </div>

        <div className="btns">
          <a className="btn btn--alpha" href="javascript:void(0)" onClick={this.handleClickFinish.bind(this)}><i className="material-icons">check</i> finish</a>
          <a className="btn btn--alpha" href="javascript:void(0)" onClick={this.handleClickCancel.bind(this)}><i className="material-icons">close</i>cancel</a>
        </div>

      </div>
    );
  }
});

const EntityDetailProps = connect(mapStateToProps)(class EntityDetailProps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      asFull: {}
    };
    const properties = this.props.state.entity._source;
    Object.keys(properties)
          .map((key) => {
            this.state.asFull[key] = false;
            return false;
          });
  }

  handleClick(e) {
    const category = e.currentTarget.getAttribute('data-category');
    this.props.dispatch(addEntity(category));

    const entity = this.props.state.entity;
    if (entity._source[category].length >= 4) {
      const asFull = Object.assign({}, this.state.asFull);
            asFull[category] = true;
      this.setState({asFull: asFull});
    }
  }

  handleClickViewAll(e) {
    const category = e.currentTarget.getAttribute('data-category');
    const asFull = Object.assign({}, this.state.asFull);
          asFull[category] = !asFull[category];
    this.setState({asFull: asFull});
  }

  render() {

    const properties = this.props.state.entity._source;

    const props = Object.keys(properties)
                        .map((key) => {

                          if (key === 'id' || key === 'title' || key === 'description' || key === 'update') {
                            return false;
                          }

                          const propValue = properties[key];
                          const asFull = this.state.asFull[key];

                          let prop = null;
                          if (Array.isArray(propValue) && propValue.length > 0) {
                            prop = propValue.map((item, i) => {
                                      if (i < 4 || asFull) {
                                        return <EntityDetailProp category={key} value={item} index={i} key={i} />;
                                      }
                                      return false;
                                    });
                          } else if (!Array.isArray(propValue)) {
                            prop = <EntityDetailProp category={key} value={propValue} key={key} />;
                          }

                          let addValue = null;
                          if ((Array.isArray(propValue) && propValue.length < 5) || asFull) {
                            addValue = <a className="icon add" href="javascript:void(0)" onClick={this.handleClick.bind(this)} data-category={key}><i className="material-icons">add</i>add value</a>;
                          }

                          let viewAll = null;
                          if (Array.isArray(propValue) && propValue.length >= 5) {
                            const text = asFull ? 'close' : 'view all';
                            viewAll = <a className="icon add viewAll" href="javascript:void(0)" onClick={this.handleClickViewAll.bind(this)} data-category={key}><span>▼</span> {text}</a>;
                          }

                          return (
                            <div key={key} className={`box-cover viewAll${asFull}`}>
                              <div className="box">
                                <h6>{key}</h6>
                                {prop}
                                {addValue}
                                {viewAll}
                              </div>
                              <div className="divider"></div>
                            </div>
                          );
                        });

    return <div>{props}</div>;
  }
});

const EntityDetailDesc = connect(mapStateToProps)(class EntityDetailDesc extends Component {

  constructor(props) {
    super(props);
    this.state = {
      descOld: this.props.desc
    };
  }

  componentDidMount() {
    window.jQuery('#textareaDesc').trigger('autoresize');
  }

  switchEditMode(bool) {
    const node = ReactDOM.findDOMNode(this.refs.description);
    if (bool) {
      node.classList.add('edit');
    } else {
      node.classList.remove('edit');
    }
  }

  handleClickEdit() {
    this.switchEditMode(true);
    const entity = Object.assign({}, this.props.state.entity);
    this.setState({descOld: entity._source.description});
  }

  handleClickFinish() {
    this.switchEditMode(false);
    const entity = this.props.state.entity;
    this.props.dispatch(saveEntity(entity));
  }

  handleClickCancel() {
    const entity = Object.assign({}, this.props.state.entity);
          entity._source.description = this.state.descOld;
    this.props.dispatch(editEntity(entity));
    this.switchEditMode(false);
  }

  handleChange(event) {
    const entity = Object.assign({}, this.props.state.entity);
          entity._source.description = event.target.value;
    this.props.dispatch(editEntity(entity));
  }

  render() {
    const {description} = this.props.state.entity._source;

    return (
      <div ref="description" className="description">
        <p>{description}</p>
        <a className="icon edit" href="javascript:void(0)" onClick={this.handleClickEdit.bind(this)}><i className="material-icons">edit</i></a>

        <div className="input-field">
          <textarea id="textareaDesc" className="materialize-textarea" value={description} onChange={this.handleChange.bind(this)} placeholder="Description..."></textarea>
        </div>

        <div className="btns">
          <a className="btn btn--alpha" href="javascript:void(0)" onClick={this.handleClickFinish.bind(this)}><i className="material-icons">check</i> finish</a>
          <a className="btn btn--alpha" href="javascript:void(0)" onClick={this.handleClickCancel.bind(this)}><i className="material-icons">close</i>cancel</a>
        </div>

      </div>
    );
  }
});

export const EntityDetail = withRouter(connect(mapStateToProps)(class EntityDetail extends Component {

  formatTime(timestamp) {
    const targetDate = new Date(Number(timestamp));
    const months = [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December'
                    ];
    const year = targetDate.getFullYear();
    const month = months[targetDate.getMonth()];
    const date = targetDate.getDate();
    const hour = targetDate.getHours();
    const min = targetDate.getMinutes();
    const time = `${hour}:${min}, ${date} ${month} ${year}`;
    return time;
  }

  render() {
    if (this.props.data === null) {
      return null;
    }

    const backBtn = this.props.backBtn;

    const {title, update: timestamp} = this.props.data._source;
    const update = this.formatTime(timestamp);

    return (

      <article className="knowledge-term knowledge1234">
        <header><h5>{title}</h5></header>

        <div className="divider title"></div>

        <EntityDetailDesc />

        <EntityDetailProps />

        <div className="edited">Last edited on {update}</div>

        {backBtn && <BackToResult/>}

      </article>

    );
  }
}));

export const Entity = withRouter(connect(mapStateToProps)(class Entity extends Component {

  handleClick() {
    const id = this.props.data._source.id;
    this.props.history.push(`/entities/${id}`);
  }

  formatTime(timestamp) {
    const targetDate = new Date(Number(timestamp));
    const months = [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December'
                    ];
    const year = targetDate.getFullYear();
    const month = months[targetDate.getMonth()];
    const date = targetDate.getDate();
    const hour = targetDate.getHours();
    const min = targetDate.getMinutes();
    const time = `${hour}:${min}, ${date} ${month} ${year}`;
    return time;
  }

  render() {
    const {id, title, description, update} = this.props.data._source;

    const updateTime = this.formatTime(update);

    return (
      <article className={`paper entity entity${id}`}>
        <div className="divider"></div>

        <CheckForFilter id={id} />
        <Favorite id={id} />

        <header>
          <h5>
            <a href="javascript:void(0)" onClick={this.handleClick.bind(this)} >{title}</a>
            <FilterLabels />
          </h5>
        </header>

        <div className="searchresult">{description}</div>
        <div className="edited">{updateTime}</div>
      </article>
    );
  }
}));

export class Entities extends Component {

  render() {
    const entities = this.props.data.map((entity) =>
      <Entity data={entity} key={entity._id} />
    );

    return (
      <div>
        {entities}
      </div>
    );
  }
}

export const BackToResult = withRouter(connect(mapStateToProps)(class BackToResult extends Component {

  render() {

    return (

      <a className="back-to-results" href="javascript:void(0)" onClick={this.props.history.goBack}><i
            className="material-icons">keyboard_arrow_left</i>Back to results</a>

    );
  }
}));

export class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children;
  }
}
