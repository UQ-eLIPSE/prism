// todo: change any types into proper types
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeData } from "../interfaces/NodeData";
import { HotspotDescription } from "../interfaces/HotspotDescription";
import { PinData } from "../components/SiteSelector";
import { MinimapReturn } from "../components/Site";

export interface apiResponse {
  success: boolean;
  payload: any;
  message: string;
}

/**
 * Wrapper function for fetch that includes credentials: 'include' in the options
 */
export async function fetchWithCredentials(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  // Set default options, including credentials: 'include'
  const defaultOptions: RequestInit = {
    ...options,
    credentials: "include",
  };

  // Call the actual fetch function with the modified options
  return fetch(url, defaultOptions);
}

export default class NetworkCalls {
  private static window_api_url = window._env_.API_URL;

  /**
   * This function calls for the /api/login/user/info endpoint to get the current logged in users information
   * Notable information includes:
   * user (username) and role (guest, projectAdmin, superAdmin)
   * @returns payload => dictionary of user information
   */
  public static async getLoginUserInfo(): Promise<any> {
    const res = await fetchWithCredentials(
      `${this.window_api_url}/api/login/user/info`,
    );
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }
    const body = await res.json();

    if (!body.success) {
      return "Error returning the logged in user info";
    }

    return body.payload;
  }

  public static async userTypeInfo(): Promise<any> {
    const res = await fetchWithCredentials(
      `${this.window_api_url}/api/user/type`,
    );
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }
    const body = await res.json();
    if (!body.success) {
      return "error returning user type";
    } else {
      return body.payload.type;
    }
  }
  public static async fetchSurveyNodes(
    floor: number,
    siteId: string,
    abortController: AbortController,
    date: Date,
  ): Promise<NodeData[]> {
    const res = await fetchWithCredentials(
      this.window_api_url +
        `/api/site/${siteId}/survey/details?floor=${floor}&date=${date.toISOString()}
                `,
      { signal: abortController.signal },
    );

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    const body = await res.json();

    if (!body.success) {
      return [];
    } else {
      return body.payload;
    }
  }

  /**
   * Function to return information about the existence of a specific site
   * @param siteId Site ID to be checked in database.
   * @returns Object containing the site id, whether the site id exists in the database, and whether the site is populated with scenes.
   */
  public static async getSurveyExistence(siteId: string) {
    const resRaw = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/exists`,
    );

    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.payload;
  }

  /**
   * Function to return information about the existence of a survey of a specific floor.
   * @param siteId Site ID to be checked in database.
   * @param floor Floor ID to be checked in database.
   * @returns Object containing the site id, the floor id, and whether the floor is populated with a survey.
   */

  public static async getFloorSurveyExistence(siteId: string, floor: number) {
    const resRaw = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/${floor}/exists`,
    );

    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.payload;
  }

  /**
   * Function to return minimap nodes for a given site id and floor number.
   * @param siteId The site ID to get minimap nodes for.
   * @param floor The floor number to get minimap nodes for.
   * @return The minimap nodes in list format.
   */
  public static async getMinimapNodeInformation(
    siteId: string,
    floorId: string,
    date?: Date,
  ): Promise<any[]> {
    const resRaw = await fetchWithCredentials(
      this.window_api_url +
        `/api/site/${siteId}/${floorId}/survey/minimapSingleSite${
          date && `?date=${date.toISOString()}`
        }`,
    );

    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.payload;
  }

  /**
   * Function to return all empty floors for a site.
   * @param siteId Site ID to be checked in database.
   * @returns Object containing array of empty floors for the site id
   */
  public static async getEmptyFloors(siteId: string) {
    const resRaw = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/emptyFloors`,
    );
    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.payload;
  }

  /**
   * Patch request to update the minimap node x and y position
   * @param minimapNode id of node to be updated
   * @param x x coordinate to be updated (in px in relation to minimap image width)
   * @param y y coordinate to be updated (in px in relatin to minimap image height)
   */
  public static async updateNodeCoordinates(
    minimapNode: any,
    x: number,
    y: number,
  ): Promise<any[]> {
    const req = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        x: x,
        y: y,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/node/coords/${minimapNode}`,
      req,
    );
    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  public static async updateTileName(
    surveyNode: any,
    tilesName: string,
  ): Promise<any[]> {
    const req = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        tiles_name: tilesName,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/node/tileName/${surveyNode}`,
      req,
    );
    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  /**
   * Patch request to update the minimap node field of view
   * @param minimapNode id of node to be updated
   * @param rotation field of view value to be updated
   */
  public static async updateNodeRotation(
    minimapNode: any,
    rotation: number,
  ): Promise<any[]> {
    const req = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        rotation: rotation,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/node/rotation/${minimapNode}`,
      req,
    );
    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  public static async fetchSurveys(
    abortController: AbortController,
    siteId: string,
    floor?: number,
  ): Promise<any[]> {
    const res = await fetchWithCredentials(
      this.window_api_url +
        `/api/site/${siteId}/survey/details/compact${
          floor ? `?floor=${floor}` : ""
        }`,
      {
        signal: abortController.signal,
      },
    );

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    const data: { success: boolean; payload: any[] } = await res.json();

    if (!data.success) {
      return [];
    }

    const surveys = data.payload
      .map((survey: any) => {
        return {
          date: new Date(survey.date),
          survey_name: survey.survey_name,
        };
      })
      .sort((one: any, two: any) => {
        if (one.date.getTime() === two.date.getTime()) {
          return -1 * one.survey_name.localeCompare(two.survey_name);
        } else {
          return one.date.getTime() <= two.date.getTime() ? 1 : -1;
        }
      });

    const groupedSurveys: any[] = [];

    surveys.forEach((val: any) => {
      const monthName = val.date.toLocaleString("en-us", {
        month: "short",
        year: "numeric",
      });
      if (
        groupedSurveys.length > 0 &&
        monthName === groupedSurveys[groupedSurveys.length - 1].monthName
      ) {
        groupedSurveys[groupedSurveys.length - 1].dates.push(val);
      } else {
        groupedSurveys[groupedSurveys.length] = {
          dates: [val],
          monthName,
        };
      }
    });

    if (abortController.signal.aborted) {
      return [];
    }

    return groupedSurveys;
  }

  public static async fetchAllSurveys(
    abortController: AbortController,
    siteId: number,
  ): Promise<any[]> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/survey/details/compact`,
      {
        signal: abortController.signal,
      },
    );
    const data: { success: boolean; payload: any[] } = await res.json();

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    if (!data.success) {
      return [];
    }

    const surveys = data.payload
      .map((survey: any) => {
        return {
          date: new Date(survey.date),
          survey_name: survey.survey_name,
        };
      })
      .sort((one: any, two: any) => {
        if (one.date.getTime() === two.date.getTime()) {
          return -1 * one.survey_name.localeCompare(two.survey_name);
        } else {
          return one.date.getTime() <= two.date.getTime() ? 1 : -1;
        }
      });

    const groupedSurveys: any[] = [];

    surveys.forEach((val: any) => {
      const monthName = val.date.toLocaleString("en-us", {
        month: "short",
        year: "numeric",
      });
      if (
        groupedSurveys.length > 0 &&
        monthName === groupedSurveys[groupedSurveys.length - 1].monthName
      ) {
        groupedSurveys[groupedSurveys.length - 1].dates.push(val);
      } else {
        groupedSurveys[groupedSurveys.length] = {
          dates: [val],
          monthName,
        };
      }
    });

    if (abortController.signal.aborted) {
      return [];
    }

    return groupedSurveys;
  }

  public static async fetchHotspotDescription(
    tilesId: string,
    siteId: string,
    abortController: AbortController,
  ): Promise<HotspotDescription[]> {
    const res = await fetchWithCredentials(
      this.window_api_url +
        `/api/site/${siteId}/hotspot/details?tilesId=${tilesId}`,
      {
        signal: abortController.signal,
      },
    );

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    const data: { success: boolean; payload: HotspotDescription[] } =
      await res.json();

    if (!data.success) {
      return [];
    }

    return data.payload;
  }

  public static async fetchMinimap(
    floor: number,
    siteId: string,
    abortController: AbortController,
  ): Promise<MinimapReturn> {
    const res = await fetchWithCredentials(
      this.window_api_url +
        `/api/site/${siteId}/minimap/details?floor=${floor}`,
      {
        signal: abortController.signal,
      },
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    if (!data.success) {
      return {
        image_url: "",
        floor: 0,
        site: "",
        image_large_url: "",
        x_pixel_offset: 0,
        y_pixel_offset: 0,
        x_scale: 0,
        y_scale: 0,
        img_width: 0,
        img_height: 0,
        xy_flipped: false,
        __v: 0,
        floor_name: "",
        floor_tag: "",
        image: "",
      };
    }
    return data.payload;
  }

  public static async fetchFloors(siteId: string): Promise<string> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/minimap/floors`,
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    if (!data.success) {
      return "";
    }

    return data.payload;
  }

  public static async addEmptyFloor(
    siteId: string,
    floor: number,
  ): Promise<string> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/minimap/newFloor/${floor}`,
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    if (!data.success) {
      return "";
    }
    return data.payload;
  }

  public static async updateMinimapNames(
    floor: number,
    siteId: string,
    tag: string,
    name: string,
  ) {
    const req = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        floor_name: name,
        floor_tag: tag,
        floor: floor,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/site/${siteId}/sitemap`,
      req,
    );

    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  public static async fetchFiles(
    id: string,
    siteId: string,
    abortController: AbortController,
  ): Promise<any[]> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/files/details?_id=${id}`,
      {
        signal: abortController.signal,
      },
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    if (!data.success) {
      return [];
    }
    return data.payload;
  }

  public static async fetchAllFiles(
    siteId: string,
    abortController: AbortController,
  ): Promise<any[]> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/files`,
      {
        signal: abortController.signal,
      },
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!data.success) {
      return [];
    }
    return data.payload;
  }

  public static async fetchDirectoryFromId(
    id: string,
    siteId: string,
    abortController: AbortController,
  ): Promise<any[]> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/directories/details?_id=${id}`,
      {
        signal: abortController.signal,
      },
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      throw new Error(message);
    }

    if (!data.success) {
      return [];
    }
    return data.payload;
  }

  public static async fetchDirectory(
    siteId: string,
    abortController: AbortController,
    directoryName?: string,
  ): Promise<any[]> {
    const res = await fetchWithCredentials(
      directoryName === undefined
        ? this.window_api_url + `/api/site/${siteId}/directories/root`
        : this.window_api_url +
            `/api/site/${siteId}/directories/details?name=${directoryName}`,
      { signal: abortController.signal },
    );
    const data: { success: boolean; payload: any } = await res.json();

    if (!data.success) {
      return [];
    }
    return data.payload;
  }

  public static async fetchAboutInfo(
    siteId: string,
    abortController: AbortController,
  ): Promise<any> {
    const res = await fetchWithCredentials(
      this.window_api_url + `/api/site/${siteId}/about`,
      {
        signal: abortController.signal,
      },
    );
    const data = await res.json();
    return data.payload;
  }

  /**
   * /api request to delete a site pin
   * @param siteId id of site to be deleted
   * @returns
   */
  public static async deleteSitePin(siteId: string): Promise<any[]> {
    const res = await fetchWithCredentials(
      `${this.window_api_url}/api/map-pins/${siteId}`,
      {
        method: "DELETE",
      },
    );
    const data: { success: boolean; payload: any; message: string } =
      await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }
    return data.payload;
  }

  /**
   * Network request to update pin data, throws error on unsuccessful network request
   * @param newPin pin with fields to update
   * @returns request payload
   *
   */
  public static async editSitePin(newPin: PinData): Promise<any[]> {
    const req = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPin),
    };
    const res = await fetchWithCredentials(
      `${this.window_api_url}/api/map-pins/${newPin._id}`,
      req,
    );
    const data: apiResponse = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.payload;
  }

  /**
   * Gets all the map pins, throws error on unsuccessful network request
   * @param abortController
   * @returns map
   */
  public static async getMapPins(
    abortController: AbortController,
  ): Promise<any> {
    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/map-pins`,
      {
        signal: abortController.signal,
      },
    );
    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.payload;
  }

  /**
   * Network POST Request to add a site pin to the database
   * Currently the POST parameters for adding a pin is not the same parameters in PinData type. This should be fixed
   * in a later date.
   * @param newPin new Pin to add
   * @param abortController
   * @returns the successful response, throw error if request is unsuccessful or fetch fails
   */
  public static async addMapPin(
    newPin: PinData,
    abortController: AbortController,
  ): Promise<apiResponse> {
    const req = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Should be generated site ID
        // site: '623971b5f0861184d7de5ba4',
        enabled: newPin.enabled,
        x: newPin.x,
        y: newPin.y,
        cover_image: newPin.cover_image
          ? newPin.cover_image
          : "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo.seedling-farm.20211116/plan.jpg",
        icon: newPin.icon,
        name: newPin.name,
        site_name: newPin.name,
        signal: abortController.signal,
        external_url: newPin.external_url,
        sitemap: newPin.sitemap,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/map-pins`,
      req,
    );
    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  }

  /**
   * Patch request to update the map pins x and y position
   * @param pin pin containing the updated x & y positions
   * @param abortController
   */
  public static async updateMapPinCoords(pin: PinData): Promise<apiResponse> {
    const req = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        _id: pin._id,
        site: pin.site,
        x: pin.x,
        y: pin.y,
        cover_image: pin.cover_image,
        icon: pin.icon,
        name: pin.name,
        __v: 0,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/map-pins/${pin._id}`,
      req,
    );
    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  /**
   * Put request to upload the preview image
   * @param imageFile file to be uploaded to the db
   * @param abortController
   */
  public static async updatePreviewImage(imageFile: any): Promise<apiResponse> {
    const formData = new FormData();
    formData.append("file", imageFile);

    const req = {
      method: "POST",
      body: formData,
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/map-pins/preview`,
      req,
    );
    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  /**
   * Put request to upload minimap image
   * @param imageFile file to be uploaded to Manta
   * @param abortController
   */
  public static async updateMinimapImage(
    imageFile: any,
    siteId: string,
    floor?: number,
  ): Promise<apiResponse> {
    const formData = new FormData();
    formData.append("file", imageFile);

    const req = {
      method: "POST",
      body: formData,
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/site/${siteId}/minimap?floor=${
        floor ? `${floor}` : "0"
      }`,
      req,
    );

    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }
    return res;
  }

  /**
   * POST request to upload a scene with the provided
   * marzipano zip file and CSV Spec.
   * @param zipFile Marzipano file to be uploaded to Manta
   * @param csvFile CSV spec file to be uploaded to Manta
   * @param siteId Associated siteId.
   */
  public static async uploadScene(
    zipFile: any,
    csvFile: any,
    siteId: string,
    floorId: number,
  ): Promise<apiResponse> {
    const formData = new FormData();
    formData.append("zipFile", zipFile);
    formData.append("properties", csvFile);

    const req = {
      method: "POST",
      body: formData,
    };
    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/site/${siteId}/${
        floorId === -1 ? 0 : floorId
      }/addScenes`,
      req,
    );

    const res = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    if (floorId === -1) {
      const resAddFloorRaw = await fetchWithCredentials(
        `${this.window_api_url}/api/site/${siteId}/minimap/newFloor/0`,
      );
      const resAddFloor = await resAddFloorRaw.json();

      if (!resAddFloor.success) {
        throw new Error("Could not create first floor in database");
      }
      return res;
    }

    return res;
  }

  /**
   * GET getFullSiteSettings
   * Retrieves the full site setting and distinguish
   * between multi or single sites.
   */
  public static async getFullSiteSettings() {
    const response = await fetchWithCredentials(
      `${this.window_api_url}/api/settings`,
    );

    const responseJson = response.json();

    return responseJson;
  }
  /**
   * GET getFullSites
   * Retrieves all the sites
   */
  public static async getFullSites() {
    const response = await fetchWithCredentials(
      `${this.window_api_url}/api/sites`,
    );

    const responseJson = response.json();

    return responseJson;
  }

  /**
   * GET getFloors
   * Retrieves all floors with a given siteId and date.
   */
  public static async getFloors(siteId: string, date: Date) {
    const res = await fetchWithCredentials(
      `${
        this.window_api_url
      }/api/site/${siteId}/survey/details/compact?date=${date.toISOString()}`,
      {},
    );
    const resJSON = await res.json();

    return resJSON;
  }

  /**
   * This function returns a sitemap, if no name is specifed then the default
   * map will be rendered (named 'default')
   * @param sitemapName
   * @returns a sitemap url
   */
  public static async getSiteMap(sitemapName?: string) {
    const res = await fetchWithCredentials(
      `${this.window_api_url}/api/site-map/${
        sitemapName ? encodeURIComponent(sitemapName) : "default"
      }`,
    );
    const resJSON = await res.json();
    return resJSON;
  }

  /**
   * This function sends an api request to create new sitemap object
   * @param sitemapName the sitemap name
   * @param imageUrl location of the sitemap image url
   * @returns success or fail response
   */
  public static async createSiteMap(sitemapName: string, imageUrl: string) {
    const req = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: sitemapName,
        image_url: imageUrl,
      }),
    };

    const resRaw = await fetchWithCredentials(
      `${this.window_api_url}/api/create-site-map`,
      req,
    );
    const res: apiResponse = await resRaw.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  }

  public static async uploadDocument(
    zipFile: File,
    siteId: string,
  ): Promise<any> {
    const formData = new FormData();
    formData.append("zipFile", zipFile);

    const req = {
      method: "POST",
      body: formData,
    };

    try {
      const resRaw = await fetchWithCredentials(
        `${this.window_api_url}/api/documentation/${siteId}`,
        req,
      );
      const res = await resRaw.json();

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error; // Re-throw to handle it in the calling code
    }
  }
}
