import { MinimapReturn } from "../components/Site";

export interface MinimapImagesData {
  minimap: string;
  floor: number;
}

export interface MinimapUpdateProps {
  setMapHover: (value: boolean) => void;
  setSelectedImage: (file: File | undefined) => void;
  setImageUrl: (value: string) => void;
  setPendingUpload: (value: boolean) => void;
  mapHover: boolean;
  imageUrl: string;
  minimapdata: MinimapReturn;
}
