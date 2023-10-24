import React, { SetStateAction, useState } from "react";
import { PinData, SitemapInterface } from "./SiteSelector";
import { useIntl } from "react-intl";
import SitemapMenuBtn from "./SitemapMenuBtn";

/**
 * This is the interface for sitemap menus
 * @param pins an array of map pins
 * @param setSitemap function to set the sitemap a user gets from a map pin
 * @param getSitemap function to get the current sitemap
 */
interface SitemapMenuInterface {
  pins: PinData[];
  setSitemap: (sitemapValue: SetStateAction<SitemapInterface>) => void;
  getSitemap: (name: string) => void;
}

/**
 * icons related to a map pin
 */
const iconClasses: { [key: string]: string } = {
  learn: "fa-solid fa-graduation-cap",
  shop: "fa-solid fa-shopping-cart",
  farm: "fa-solid fa-leaf",
  animal: "fa-solid fa-cow",
  pig: "fa-solid fa-piggy-bank",
  truck: "fa-solid fa-truck-fast",
  default: "fa-solid fa-plus",
};

/**
 * This function renders the view of pins grouped by their sitemaps on the menu.
 * Given that there is a change in sitemap name, then an additional li
 * object with the new sitemap name is made
 * @param pin the current pin in the array
 * @param previousPin the previous pin in the array
 * @param getSitemap get the sitemap name that the pin belongs to
 * @returns either a single li or double li (change in sitemap grouping)
 */
function groupPinbySitemap(
  pin: PinData,
  previousPin: PinData,
  getSitemap: (value: string) => void,
  setIsOpen: (value: boolean) => void,
  index: number,
) {
  if (previousPin) {
    if (pin.sitemap === previousPin.sitemap) {
      return (
        <li
          key={index}
          id={pin.name}
          className="site-pin-menu sitemap-menu-padding"
          onClick={() => {
            setIsOpen(false);
            getSitemap(pin.sitemap);
            localStorage.setItem("currentSitemap", pin.sitemap);
          }}
        >
          <i className={iconClasses[pin.icon]} id="select-icon"></i>
          {pin.name}
        </li>
      );
    }
  }

  return (
    <div key={index + 2}>
      <li
        key={index + 3}
        id="sitemap-label"
        className="sitemap-menu-label sitemap-menu-padding label-gap"
      >
        {decodeURIComponent(pin.sitemap)}
      </li>
      <li
        key={index + 4}
        id={pin.name}
        className={`site-pin-menu sitemap-menu-padding`}
        onClick={() => {
          setIsOpen(false);
          getSitemap(pin.sitemap);
          localStorage.setItem("currentSitemap", pin.sitemap);
        }}
      >
        <i className={iconClasses[pin.icon]} id="select-icon"></i>
        {pin.name}
      </li>
    </div>
  );
}

/**
 * This function sorts pins by their sitename in alphabetical order
 * @param pins an unorderd array of pins
 * @returns pins in sitemap alphabetical order
 */
function sortPinsBySitemap(pins: PinData[]) {
  const sortedPins = pins.sort((pinA, pinB) =>
    pinA.sitemap.localeCompare(pinB.sitemap),
  );
  return sortedPins;
}

/**
 * This renders a button and menu which displays all pins avaliable on the sitemap
 * Pins are listed and grouped by the sitemap they belong to
 * @returns a menu with all maps pins avaliable
 */
function SitemapMenu(props: SitemapMenuInterface) {
  const { pins, getSitemap } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const messages = useIntl();
  return (
    <div>
      <div
        id="grey-overlay"
        className={
          isOpen ? `sitemap-menu-overlay` : `sitemap-menu-overlay hide-overlay`
        }
        onClick={() => {
          isOpen && setIsOpen(false);
        }}
      ></div>
      <SitemapMenuBtn
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        label={messages.formatMessage({ id: "seeMoreFarms" })}
      />
      {isOpen && (
        <ul className={`sitemap-menu-full`}>
          {/* this section renders the list of map pins */}
          {sortPinsBySitemap(pins).map((pin, index, array) => {
            return groupPinbySitemap(
              pin,
              array[index - 1],
              getSitemap,
              setIsOpen,
              index,
            );
          })}
          <div
            className="sitemap-menu-header sitemap-menu-padding"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <i className="fa-solid fa-angle-down" id="arrow-icon" />
            <h3 className="sitemap-menu-btn-label">
              {messages.formatMessage({ id: "seeLessFarms" })}
            </h3>
          </div>
        </ul>
      )}
    </div>
  );
}

export default SitemapMenu;
