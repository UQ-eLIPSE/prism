import { ObjectId } from "mongodb";
import { MapPins } from "../components/MapPins/MapPinsModel";

const getDocumentCounts = async (site: string) => {
  const data = await MapPins.countDocuments({
    site: new ObjectId(site),
  });

  return data;
};

export default { getDocumentCounts };
