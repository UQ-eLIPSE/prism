import React, { useState } from "react";
import NetworkCalls from "../../utils/NetworkCalls";
import Modal from "./Modal";
import { ImageDropDownInputInterface, ModalTypes } from "./Modal.type";
import { PinData, SitemapInterface } from "../SiteSelector";

/**
 * Interface for a sitemap modal
 * @param setSitemapModal toggles modal view on and off
 * @param setPins function to update the site pins on the map (used for after adding a defautl site pin to a new sitemap)
 */
interface SiteMapModalInterface {
  toggleSiteMapModal: (value: boolean) => void;
  setPins: (value: PinData[]) => void;
  setSitemap: (value: SitemapInterface) => void;
}

/**
 * This component renders the modal popup for adding new sitemaps
 * @returns a modal popup
 */
function SiteMapModal(props: SiteMapModalInterface) {
  const { toggleSiteMapModal, setPins, setSitemap } = props;
  const [image, setImage] = useState<string>("");
  const [sitemapName, setSiteMapName] = useState<string>("");
  const ModalImageDropDownProp: ImageDropDownInputInterface = {
    view: true,
    image,
    setImage,
  };

  /**
   * This function handles the validation of the modal form
   * If not errors are found then the createSitemap() function is called
   */
  function handleSubmit() {
    // check that any type of image was uploaded
    const isImageUploadedError = image === "";
    const isImageUploadedErrorMsg = isImageUploadedError ? "- An image \n" : "";

    // make sure a map name is provided
    const sitemapNameErrorMsg = sitemapName === "" ? "- A map name \n" : "";

    sitemapName === "" || isImageUploadedError
      ? window.alert(
          "You are missing the following: \n" +
            isImageUploadedErrorMsg +
            sitemapNameErrorMsg,
        )
      : createSitemap();
  }

  /**
   * This function calls an endpoint which creates a new sitemap document in the
   * site_map collection
   */
  async function createSitemap() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await NetworkCalls.createSiteMap(sitemapName, image).then((res: any) => {
        setSitemap({
          name: res.payload.name,
          image_url: res.payload.image_url,
        });
      });
      // also create a new site map pin so the user can access the map
      await NetworkCalls.addMapPin(
        {
          _id: Math.random().toString(16).slice(2),
          site: "",
          enabled: true,
          x: 50,
          y: 50,
          cover_image:
            "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo.seedling-farm.20211116/plan.jpg",
          icon: "farm",
          name: "default pin",
          sitemap: encodeURIComponent(sitemapName),
        },
        new AbortController(),
      );

      // after creating the new sitemap pin update the sitemaps menu by updating the pins
      const req = await NetworkCalls.getMapPins(new AbortController());
      setPins(req);
    } catch (e) {
      window.alert(`Error! \n\n Failed to Upload a New Sitemap  \n ${e}`);
    }
    toggleSiteMapModal(false);
  }

  return (
    <Modal
      title={"sitemapModalTitle"}
      toggleModal={toggleSiteMapModal}
      showImageDragDrop={ModalImageDropDownProp}
      type={ModalTypes.create}
      handleSubmit={handleSubmit}
      showPinIconSelector={{ view: false }}
      inputs={[
        {
          label: "sitemapModalLabel",
          setValue: setSiteMapName,
          value: sitemapName,
          placeholder: "Enter a map name",
          hasCheckbox: false,
        },
      ]}
    />
  );
}

export default SiteMapModal;
