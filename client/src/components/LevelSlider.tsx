import React, { useEffect, useState } from "react";
import NetworkCalls from "../utils/NetworkCalls";
interface Props {
  timelineOpen: boolean;
  floor: number;
  changeFloor: (floorId: number) => void;
  date: Date;
  configFloor: number;
  siteId: string;
  floorTag: string;
  availableFloors: number[];
}

interface FloorData {
  minimap: string;
  floor: number;
  site: string;
  floor_name: string;
  floor_tag: string;
}

function LevelSlider(props: Props) {
  const { changeFloor } = props;
  const [numFloors, setNumFloors] = useState<number>(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [floorTagArray, setFloorTagArray] = useState<any>({});
  const [, setPopulatedFloors] = useState<number[]>([]);

  useEffect(() => {
    getFloorDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.floorTag]);

  useEffect(() => {
    getFloorDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numFloors]);

  /**
   * This function gets the all floor details and adds the floor tag to the floorTagArray.
   */
  function getFloorDetails() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NetworkCalls.fetchFloors(props.siteId).then((res: any) => {
      setNumFloors(res[0].floor === 0 ? res.length - 1 : res.length);

      JSON.parse(JSON.stringify(res)).forEach((item: FloorData) => {
        NetworkCalls.getFloorSurveyExistence(props.siteId, item.floor).then(
          (res) => {
            if (res.floorPopulated) {
              setPopulatedFloors((currentFloors) => [
                ...currentFloors,
                item.floor,
              ]);
            }
          },
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFloorTagArray((prevState: any) => ({
          ...prevState,
          [item.floor]: item.floor_tag,
        }));
      });
    });
  }

  /**
   * This function takes the foors and number of floors to generate a list of
   * radio buttons for level selection, as well as generating a button
   * for creating/adding a level
   * @param floors The floors number array/list containing the floors for a site
   * @param noFloors the number of floors used on this site
   * @returns a React element array/list containing all the radio buttons and the
   * add level button
   */
  function getFloorsJSX(numFloors: number): React.ReactElement[] {
    const radioList = [];
    for (let i = props.configFloor === 0 ? 0 : 1; i <= numFloors; i++) {
      radioList.push(
        <label
          key={i}
          className={`
                        ${i === Number(props.floor) ? "checked" : ""}
                        ${
                          !props.availableFloors.includes(i)
                            ? "floorDisabled"
                            : ""
                        }
                    `}
          onClick={(): void => {
            props.availableFloors.includes(i) && changeFloor(i);
          }}
        >
          <span>{floorTagArray[i]}</span>
        </label>,
      );
    }

    radioList.reverse();
    // Commented out due to unused feature
    // May be re-enabled later on.
    // radioList.unshift(addButton);

    return radioList;
  }

  return (
    <div
      className={`levelSliderContainer ${props.timelineOpen && "timelineOpen"}`}
    >
      <div>{getFloorsJSX(numFloors)}</div>
    </div>
  );
}

export default LevelSlider;
