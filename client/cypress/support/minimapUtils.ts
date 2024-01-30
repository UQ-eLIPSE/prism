export interface MiniMapAction {
  url: string;
  method: string;
  alias: string;
}

export interface MiniMapActions {
  patchRequest: MiniMapAction;
  getRequest: MiniMapAction;
  getRotationRequest: MiniMapAction;
}

export const actions: MiniMapActions = {
  patchRequest: {
    url: "/api/node/coords/*",
    method: "PATCH",
    alias: "patchNode",
  },
  getRequest: {
    url: "/api/site/*/*/survey/minimapSingleSite*",
    method: "GET",
    alias: "getMinimapData",
  },
  getRotationRequest: {
    url: "/api/node/rotation/*",
    method: "PATCH",
    alias:"patchNodeRotation"
  }
};

/**
 * Helper function to intercept the minimap data and return the alias for each action
 * @param {MiniMapAction[]} actions - list of actions to intercept. i.e. PATCH, GET
 * @returns {string[]} - list of alias for each action starting with "@"
 */
export const interceptMinimapData = (...actions: MiniMapAction[]): string[] => {
  return actions.map((action) => {
    cy.intercept(action.method, action.url).as(action.alias);
    return `@${action.alias}`;
  });
};

export const expandMiniMap = (): void => {
  cy.get('i[class*="fa-expand-arrows-alt"]').click({
    timeout: 10000,
    force: true,
  });
};

export const editSelectedNode = (): void => {
  cy.get("p").contains("Edit Node").should("exist").click({ force: true });
  cy.get("h2").contains("Select a Node to Edit");
  cy.get("[data-cy='selected-node']").click({ force: true });
};

export const editNodePosition = (coordId: string, coordValue: string): void => {
  cy.get(`input[id='${coordId}']`).should("exist").clear();
  cy.get(`input[id='${coordId}']`).should("exist").type(coordValue);
};
