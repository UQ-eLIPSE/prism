import * as React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { ISidebarLink } from "../components/Sidebar";

interface Props {
  value: ISidebarLink;
  currentPath: string;
  hideMenu: boolean;
  setPath: (value: string) => void;
}

export const NavLink = (props: Props): React.ReactElement => {
  return (
    <Link
      to={props.value.link}
      data-cy={props.value.dataCy}
      onClick={(): void => props.setPath(props.value.link)}
      className={classNames({
        active: props.currentPath === props.value.link,
        small: props.hideMenu,
      })}
    >
      <div className="nav-icon-container">
        {props.value.text === "" && (
          <img className="prismLogo" src={props.value.icon} alt="" />
        )}
        <span
          className="nav-icon"
          data-title={props.value.text}
          data-cy="sb-icon"
        >
          <i className={props.value.icon} />
        </span>
        <span className={"nav-text"} data-cy="sb-text">
          {props.value.text}
        </span>
      </div>
    </Link>
  );
};
