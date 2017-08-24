import queryString from 'query-string';

const parsed = queryString.parse(window.location.search);
const initialState = {
  q: parsed.q,
  page: (parsed.page || 1) - 1,
  documentId: null,
  document: null,
  documents: [],
  documentTotal: 0,
  documentsFetchSize: 20
};

export function reducers(state = initialState, action) {
  switch (action.type) {
    case CHANGE_Q:
      return Object.assign({}, state, {
        q: action.q
      });
    case CHANGE_PAGE:
      return Object.assign({}, state, {
        page: action.page
      });
    case REQUEST_DOCUMENT:
      return Object.assign({}, state, {
        documentId: action.documentId
      });
    case RECEIVE_DOCUMENT:
      return Object.assign({}, state, {
        document: action.document
      });
    case REQUEST_DOCUMENTS:
      return Object.assign({}, state, {
        q: action.q,
        page: action.page
      });
    case RECEIVE_DOCUMENTS:
      return Object.assign({}, state, {
        documents: action.documents,
        documentsTotal: action.documentsTotal
      });
    default:
      return state;
  }
}

const CHANGE_Q = "CHANGE_Q";

export function changeQ(q) {
  return {
    type: CHANGE_Q,
    q
  };
}

const CHANGE_PAGE = "CHANGE_PAGE";

export function changePage(page) {
  return {
    type: CHANGE_PAGE,
    page
  };
}

const REQUEST_DOCUMENT = "REQUEST_DOCUMENT";

export function requestDocument(documentId) {
  return {
    type: REQUEST_DOCUMENT,
    documentId
  };
}

const RECEIVE_DOCUMENT = "RECEIVE_DOCUMENT";

export function receiveDocument(json) {
  return {
    type: RECEIVE_DOCUMENT,
    document: json.hits.hits.map((item) => item._source)[0]
  };
}

const REQUEST_DOCUMENTS = "REQUEST_DOCUMENTS";

export function requestDocuments(q, page) {
  return {
    type: REQUEST_DOCUMENTS,
    q,
    page
  };
}

const RECEIVE_DOCUMENTS = "RECEIVE_DOCUMENTS";

export function receiveDocuments(json) {
  return {
    type: RECEIVE_DOCUMENTS,
    documents: json.hits.hits.map((item) => item._source),
    documentsTotal: json.hits.total
  };
}