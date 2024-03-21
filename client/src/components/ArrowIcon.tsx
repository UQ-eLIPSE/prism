import { Icon } from "@material-ui/core";
import React from "react";

interface ArrowIconProps {
  showArrow?: boolean;
  containerProps?: {
    className?: string;
    style?: React.CSSProperties;
  };
  iconProps?: {
    className?: string;
    style?: React.CSSProperties;
  };
  dataCy?: string;
}

/**
 * Renders an arrow icon to indicate the direction of a node in the minimap.
 * Deafault arrow icon is an up arrow.
 */
const ArrowIcon = ({
  showArrow,
  containerProps,
  iconProps,
  dataCy,
}: ArrowIconProps): JSX.Element => {
  return (
    <>
      {showArrow && (
        <div
          className={containerProps?.className}
          style={containerProps?.style}
        >
          <Icon
            className={`fa fa-arrow-up ${iconProps?.className}`}
            style={iconProps?.style}
            data-cy={dataCy}
          />
        </div>
      )}
    </>
  );
};

export default ArrowIcon;
