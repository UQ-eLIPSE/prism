import React from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";

interface MinimapImageProps {
  mapHoverStyleCondition: boolean;
  imageUrl: string;
  imageAlt: string;
  imageStyle: React.CSSProperties;
  additionalImgClasses?: string;
  handleOnClick?: () => void;
}

const MinimapImage: React.FC<MinimapImageProps> = ({
  mapHoverStyleCondition,
  imageUrl,
  imageAlt,
  imageStyle,
  additionalImgClasses,
  handleOnClick,
}) => {
  return (
    <img
      className={classNames(
        additionalImgClasses,
        MinimapStyles.minimapImage,
        MinimapStyles.largeMapImg,
        {
          [MinimapStyles.minimapImgHover]: mapHoverStyleCondition,
        },
      )}
      onClick={handleOnClick}
      src={imageUrl}
      alt={imageAlt}
      style={imageStyle}
    />
  );
};

export default MinimapImage;
