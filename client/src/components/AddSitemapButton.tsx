import Add from "@mui/icons-material/Add";
import React from "react";
import { FormattedMessage } from "react-intl";

interface AddSitemapButtonInterface {
  setSitemapModal: (value: boolean) => void;
  disable: boolean;
}

/**
 * This component is the add a sitemap button and toggles the sitemap modal
 * @param setSitemapModal toggles the modal (on/off)
 * @param disable if the add site pin button, then disable is true and
 * do not show the sitemap modal (users can only do one function at a time i.e
 * add site map or add site pin)
 * @returns a button
 */
function AddSitemapButton(props: AddSitemapButtonInterface) {
  const { setSitemapModal, disable } = props;
  return (
    <button
      className={`${disable && "disable-button"}`}
      onClick={() => {
        !disable && setSitemapModal(true);
      }}
    >
      <Add />
      <p>
        <FormattedMessage id="sitemapModalTitle" />
      </p>
    </button>
  );
}

export default AddSitemapButton;
