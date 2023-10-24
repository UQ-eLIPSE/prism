export interface HotspotDescription {
  header: {
    main_img_url: string;
    label_title: string;
  };
  contents: {
    title: string;
    content: string;
  }[];
  tiles_id: string;
  info_id: string;
}
