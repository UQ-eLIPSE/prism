import { ObjectId } from "mongodb";
import { MapPins } from "../components/MapPins/MapPinsModel";

const getDocumentCounts = async (site: string) => {
  return MapPins.countDocuments({
    site: new ObjectId(site),
  });
};

export default { getDocumentCounts };
