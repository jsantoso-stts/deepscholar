class Api {
  static fetchApi(path, options, token) {
    const defaultHeaders = new Headers();
    defaultHeaders.append("Content-Type", "application/json");
    const headers = options.headers || defaultHeaders;

    if (token) {
      headers.append("authorization", `bearer ${token}`);
    }

    const o = Object.assign({
      accept: "application/json",
      headers
    }, options);

    return fetch(path, o)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then((response) => response.json())
      .then((json) => json)
      .catch(console.log);
  }

  static search(typeName, options, token) {
    options.body = JSON.stringify(options.body);
    const o = Object.assign({
      method: "post",
      body: null
    }, options);
    const indices = typeName === 'entities' ? 'entities' : 'papers';
    const path = `/api/${indices}/${typeName}/_search`;
    return Api.fetchApi(path, o, token);
  }

  static searchText(options, token) {
    return Api.search("text", options, token);
  }

  static searchFigs(options) {
    return Api.search("figs", options);
  }

  static searchTables(options) {
    return Api.search("tables", options);
  }

  static searchEntities(options, token) {
    return Api.search("entities", options, token);
  }

  static verify(token) {
    return Api.fetchApi("/api/auth/verify", {}, token);
  }

  static initializePapers(token) {
    return Api.fetchApi("/api/admin/papers/initialize", {method: "POST"}, token);
  }

  static importPapers(token, file) {
    const body = new FormData();
    body.append("indexes", file);

    const headers = new Headers();

    return Api.fetchApi("/api/admin/papers/import", {method: "POST", body, headers}, token)
      .catch((e) => {
        console.log(e);
      });
  }

  static initializeEntities(token) {
    return Api.fetchApi("/api/admin/entities/initialize", {method: "POST"}, token);
  }

  static importEntities(token, file) {
    const body = new FormData();
    body.append("indexes", file);

    const headers = new Headers();

    return Api.fetchApi("/api/admin/entities/import", {method: "POST", body, headers}, token)
      .catch((e) => {
        console.log(e);
      });
  }
}

export default Api;
