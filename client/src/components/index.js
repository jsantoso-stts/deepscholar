import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import './style.css';
import {saveScrollY, toggleAllAuthors, toggleAbstract, updateLabelList, favoriteKey, knowledgeAdd, knowledgeUpdate, knowledgeRemove} from "../module";

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
    const paperId = this.props.paperId;
    return (
      <div className="checkbox">
        <input type="checkbox" id={paperId} className="filled-in" onChange={this.handleChange.bind(this)}/>
        <label htmlFor={paperId}></label>
      </div>
    );
  }
});

const Favorite = connect(mapStateToProps)(class CheckBoxForFilter extends Component {

  handleClick(e) {
    const labelList = Object.assign({}, this.props.state.labelList);
    const favList = labelList[favoriteKey];
    const id = e.currentTarget.dataset.id;
    const index = labelList[favoriteKey].indexOf(id);
    // exist ? remove : add;
    if (index !== -1) {
      favList.splice(index, 1);
    } else {
      favList.push(id);
    }
    this.props.dispatch(updateLabelList(labelList));
  }

  render() {
    const paperId = this.props.paperId;
    return (
      <div className="favorite" data-id={paperId} onClick={this.handleClick.bind(this)}>
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
    const pdfannoUrl = `https://paperai.github.io/pdfanno/latest/?pdf=${pdf}`;

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
        <CheckForFilter paperId={id}/>
        <Favorite paperId={id}/>

        <header>
          <h5>
            <a href="javascript:void(0)" onClick={this.handleClick.bind(this, paperUrl)}
               dangerouslySetInnerHTML={articleTitle}></a>
            <FilterLabels paperId={id}/>
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
      category: this.props.category,
      index: this.props.index,
      value: this.props.value || "",
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
    this.switchEditMode(true);
    this.setState({valueOld: this.state.value});
  }

  handleClickRemove() {
    this.props.dispatch(knowledgeRemove(this.state.category, this.props.index));
  }

  handleClickFinish() {
    this.switchEditMode(false);
    this.props.dispatch(knowledgeUpdate(this.state.category, this.props.index, this.state.value));
  }

  handleClickCancel() {
    this.switchEditMode(false);
    this.setState({value: this.state.valueOld});
    this.props.dispatch(knowledgeUpdate(this.state.category, this.props.index, this.state.valueOld));
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {

    const {knowledgeData, knowledgeOptions} = this.props.state;

    const category = this.state.category;
    const index = this.state.index;
    const value = knowledgeData.properties[category][index];

    const options = knowledgeOptions[category].map(item => {
      return <option value={item} key={item}>{item}</option>;
    });

    return (
      <div ref="thisElem" className="box-row">

        <p>Value: {value}</p>

        <div className="editBtns">
          <a className="icon edit" href="javascript:void(0)" onClick={this.handleClickEdit.bind(this)}><i className="material-icons">edit</i></a>
          <a className="icon delete" href="javascript:void(0)" onClick={this.handleClickRemove.bind(this)}><i className="material-icons">delete_forever</i></a>
        </div>

        <div className="input-field input-field--alpha">
          <select ref="select" value={value} onChange={this.handleChange.bind(this)} >
            <option value="">Choose value</option>
            {options}
          </select>
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

  handleClick(e) {
    const category = e.currentTarget.getAttribute('data-category');
    this.props.dispatch(knowledgeAdd(category));
  }

  render() {

    const {knowledgeData} = this.props.state;

    const props = Object.keys(knowledgeData.properties)
                        .map((key) => {
                          const propsArr = knowledgeData.properties[key];

                          let prop;
                          if (propsArr.length > 0) {
                            prop = propsArr.map((item, i) => {
                                      return <EntityDetailProp category={key} value={item} index={i} key={i} />;
                                    });
                          } else {
                            prop = null;
                          }

                          // 追加の設定
                          return (
                            <div key={key}>
                              <div className="box">
                                <h6>{key}</h6>
                                {prop}
                                <a className="icon add" href="javascript:void(0)" onClick={this.handleClick.bind(this)} data-category={key}><i className="material-icons">add</i>add value</a>
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
      desc: this.props.desc || "",
      descOld: this.props.desc || ""
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
    this.setState({descOld: this.state.desc});
  }

  handleClickFinish() {
    this.switchEditMode(false);
  }

  handleClickCancel() {
    this.setState({desc: this.state.descOld});
    this.switchEditMode(false);
  }

  handleChange(event) {
    this.setState({desc: event.target.value});
  }

  render() {

    const desc = this.state.desc;

    return (
      <div ref="description" className="description">
        <p>{desc}</p>
        <a className="icon edit" href="javascript:void(0)" onClick={this.handleClickEdit.bind(this)}><i className="material-icons">edit</i></a>

        <div className="input-field">
          <textarea id="textareaDesc" className="materialize-textarea" value={desc} onChange={this.handleChange.bind(this)} placeholder="Description..."></textarea>
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

  render() {

    const {knowledgeData} = this.props.state;

    const backBtn = this.props.backBtn;

    const title = knowledgeData.title;
    const desc = knowledgeData.desc;

    return (

      <article className="knowledge-term knowledge1234">
        <header><h5>{title}</h5></header>

        <div className="divider title"></div>

        <EntityDetailDesc desc={desc} />

        <EntityDetailProps/>

        <div className="edited">Last edited on 17:35, 28 March 2018</div>

        {backBtn && <BackToResult/>}

      </article>

    );
  }
}));

export const Entity = withRouter(connect(mapStateToProps)(class Entity extends Component {

  handleClick() {
    this.props.history.push('/knowledge/term');
  }

  render() {

    const id = Number(this.props.id);

    const title = [
        "Deep Learning",
        "Learning TensorFlow: A Guide to Building Deep learning Systems",
        "Human-level control through deep reinforcement learning",
        "IMS at EmoInt-2017: Emotion Intensity Prediction with Affective Norms, Automatically Extended Resources and Deep Learning",
        "Unsupervised Deep Learning Applied to Breast Density Segmentation and Mammographic Risk Scoring"
    ];

    const desc = [
        "branch of machine learning",
        "Nature article by LeCun, Bengio and Hinton",
        "scientific article",
        "scientific article (publication date: May 2016)",
        "Deep Learning Supercomputer System"
    ];

    return (
      <article className="paper paper1234">
        <div className="divider"></div>

        <CheckForFilter paperId="1" />
        <Favorite paperId="1" />

        <header><h5><a href="javascript:void(0)" onClick={this.handleClick.bind(this)} >{title[id]}</a></h5></header>
        <div className="searchresult">{desc[id]}</div>
        <div className="edited">Last edited on 17:35, 28 March 2018</div>
      </article>
    );
  }
}));

export class Entities extends Component {

  render() {

    return (
      <div>
        <Entity id="0" />
        <Entity id="1" />
        <Entity id="2" />
        <Entity id="3" />
        <Entity id="4" />
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
