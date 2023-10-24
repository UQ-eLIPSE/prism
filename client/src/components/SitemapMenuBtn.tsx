import React from "react";

/**
 * Props for a SitemapMenuBtn
 * @param label the text to display on the btn i.e "see more farms"
 * @param isOpen the boolean that opens or closes the sitemap menu
 * @param setIsOpen setting the sitemap menu to open or close
 */
interface SitemapMenuBtnInterface {
  label: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

/**
 * This renders a sitemap button at the bottom of the homepage
 * @returns a button that can open/close a menu (located at the bottom of a page)
 */
function SitemapMenuBtn(props: SitemapMenuBtnInterface) {
  const { label, isOpen, setIsOpen } = props;
  return (
    <div
      className={isOpen ? `sitemap-button hidden` : `sitemap-button`}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      <i className="fa-solid fa-angle-up" id="arrow-icon" />
      <h3 className="sitemap-menu-btn-label">{label}</h3>
    </div>
  );
}

export default SitemapMenuBtn;
