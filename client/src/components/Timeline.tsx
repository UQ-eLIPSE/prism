// todo fix the Function type and any calls in this file
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";
import TimelineStyles from "../sass/partials/_timeline.module.scss";
import classNames from "classnames";
import { SurveyMonth, SurveyDate } from "../interfaces/NodeData";

interface Props {
  timelineOpen: boolean;
  floor: number;
  changeFloor: Function;
  date: Date;
  changeDate: Function;
  closeTimelineFunction: Function;
  siteId: string;
  updateAvailableFloors: Function;
  availableFloors: number[];
  floorExists: boolean;
  updateFloors: Function;
  surveyWithFloors: SurveyMonth[]; //The surveyWithFloors variable is for fetching survey data limited to a specific floor
  siteSurveys: SurveyMonth[]; // siteSurveys fetches all surveys for the entire site without floor restriction
  changeDateAndUpdateFloors: (date: Date) => Promise<void>;
}

function Timeline(props: Props) {
  const [surveys, setSurveys] = useState<SurveyMonth[]>([]);
  const [currentMonthName, setCurrentMonthName] = useState<string>("");
  const [expandedAccordian, setExpandedAccordian] = useState<string>("");
  const [, setIsExpanded] = useState<boolean>(true);
  const [allSurveys, setAllSurveys] = useState<SurveyMonth[]>([]);
  const drawerContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const fetchingSurveys = async () => {
      setSurveys(props.surveyWithFloors);
      await props.updateFloors();
      setCurrentMonthName(
        props.date.toLocaleString("en-us", {
          month: "short",
          year: "numeric",
        }),
      );
      const scrollControl = drawerContainerRef.current;
      let positioningMonthIndex = 0;
      for (const [i, survey] of props.siteSurveys.entries()) {
        if (survey.monthName === currentMonthName) positioningMonthIndex = i;
      }
      if (scrollControl) {
        scrollControl.scrollTo({
          top: 50 * positioningMonthIndex - scrollControl.clientHeight / 2,
        });
      }

      setAllSurveys(props.siteSurveys);
      const months = [];
      for (const survey of props.siteSurveys) {
        for (const date of survey.dates) {
          months.push(date.date.toISOString());
        }
      }
      if (
        !months.includes(props.date.toISOString()) &&
        props.siteSurveys.length > 0
      )
        changeDate(props.siteSurveys[0].dates[0].date);
      switchSurveys();
    };

    fetchingSurveys();
  }, [props.siteSurveys]);

  const getMonthJSX = (month: SurveyMonth): React.ReactElement[] => {
    return month.dates.map((date: SurveyDate) => {
      const dayString = date.date.toLocaleString("en-us", {
        day: "numeric",
      });

      return (
        <div
          className={classNames(TimelineStyles.surveyDateContainer, {
            [TimelineStyles.selectedSurvey]:
              date.date.getTime() === props.date.getTime(),
          })}
          onClick={() => changeDate(date.date)}
          key={date.date.toLocaleDateString() + month.monthName}
          data-cy={
            date.date.getTime() === props.date.getTime()
              ? "timeline-selected-survey"
              : "survey-date-container"
          }
        >
          <div
            className={classNames(TimelineStyles.node, {
              [TimelineStyles.selectedNode]:
                date.date.getTime() === props.date.getTime(),
            })}
          />
          <p>
            {dayString.padStart(2, "0")}{" "}
            {date.survey_name.length > 0 ? (
              <>
                {" "}
                - <strong>{date.survey_name}</strong>
              </>
            ) : (
              `${month.monthName}`
            )}
          </p>
          <div className={TimelineStyles.timeline}></div>
        </div>
      );
    });
  };

  const getCurrentSurvey = (month: SurveyMonth): any[] => {
    return month.dates
      .map((date: SurveyDate, i) => {
        return date.date.getTime() === props.date.getTime() ? (
          <div key={i}>
            <span className={TimelineStyles.currentSurvey}>
              {date.survey_name}
            </span>
          </div>
        ) : null;
      })
      .filter((validEl) => !!validEl);
  };

  const updateSurveysJSX = (
    surveys: SurveyMonth[],
    allSurveys: SurveyMonth[],
  ): React.ReactElement[] => {
    return allSurveys.map((month: SurveyMonth) => {
      return (
        <div className={TimelineStyles.monthContainer} key={month.monthName}>
          <Accordion
            elevation={0}
            expanded={expandedAccordian === month.monthName}
            onChange={() => {
              setExpandedAccordian(
                expandedAccordian === month.monthName ? "" : month.monthName,
              );
              setIsExpanded(expandedAccordian !== month.monthName);
            }}
          >
            <AccordionSummary
              expandIcon={<i className={"fa fa-chevron-down fa-2x"} />}
            >
              <button
                onClick={(event): void => showLatestSurveyInMonth(month, event)}
                onFocus={(event) => event.stopPropagation()}
                className={classNames(TimelineStyles.monthName, {
                  [TimelineStyles.currentMonth]:
                    currentMonthName === month.monthName,
                })}
              >
                <div className={TimelineStyles.monthNameDiv}>
                  {month.monthName}
                </div>
                {getCurrentSurvey(month).length > 0 ? (
                  <div key={0} className={TimelineStyles.surveyDiv}>
                    <span className={TimelineStyles.selectedSurvey}>
                      {month.dates[0].survey_name.length > 0
                        ? month.dates[0].survey_name
                        : props.date.toLocaleDateString()}
                      {}
                    </span>
                  </div>
                ) : (
                  <div key={0} className={TimelineStyles.surveyDiv}>
                    <span className={TimelineStyles.inactiveSurvey}>
                      {month.dates[0].survey_name}
                    </span>
                  </div>
                )}
              </button>
            </AccordionSummary>

            <AccordionDetails>
              <div className={TimelineStyles.surveyContainer}>
                {getMonthJSX(month)}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      );
    });
  };

  const switchSurveys = (): void => {
    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
        //current index and survey index
        let monthIndex = 0;
        let surveyIndex = 0;

        //the survey/month we want to change to
        let surveyIndexMod = 0;
        let monthIndexMod = 0;

        let tempIndex: SurveyMonth = surveys[monthIndex];

        //month index used for position
        let positioningMonthIndex = 0;

        //get the current month & survey
        surveys.forEach((month: SurveyMonth, i) => {
          if (month.monthName === currentMonthName) {
            monthIndex = i;
            month.dates.forEach((date, j) => {
              if (date.date.getTime() === props.date.getTime()) {
                surveyIndex = j;
              }
            });
          }
        });

        allSurveys.forEach((month: SurveyMonth, i: number) => {
          if (month.monthName === currentMonthName) {
            positioningMonthIndex = i;
          }
        });
        const scrollControl = drawerContainerRef.current;
        if (e.code === "ArrowRight") {
          if (scrollControl) {
            const topOfScreen = scrollControl.scrollTop;
            const bottomOfScreen = topOfScreen + scrollControl.clientHeight;
            const screenMiddle = Math.abs(bottomOfScreen - topOfScreen) / 2;
            const currPosition = 50 * positioningMonthIndex;
            const distToTop = Math.abs(currPosition - topOfScreen);
            if (topOfScreen > 0 && distToTop < screenMiddle) {
              scrollControl.scrollBy({ top: -50 });
            }
          }
          surveyIndexMod = surveyIndex - 1;
          monthIndexMod = monthIndex - 1;
        } else if (e.code === "ArrowLeft") {
          if (scrollControl) {
            const topOfScreen = scrollControl.scrollTop;
            const bottomOfScreen = topOfScreen + scrollControl.clientHeight;
            const screenMiddle = Math.abs(bottomOfScreen - topOfScreen) / 2;
            const currPosition = 50 * positioningMonthIndex;
            const distToBottom = bottomOfScreen - currPosition;
            if (
              bottomOfScreen < scrollControl.scrollHeight &&
              distToBottom < screenMiddle
            ) {
              scrollControl.scrollBy({ top: 50 });
            }
          }
          surveyIndexMod = surveyIndex + 1;
          monthIndexMod = monthIndex + 1;
        }

        //Is the current month the expanded month
        if (
          surveys[monthIndex] &&
          surveys[monthIndex].monthName === expandedAccordian &&
          expandedAccordian.length > 0
        ) {
          tempIndex = surveys[monthIndex];

          //if the next survey is defined move to it
          if (tempIndex.dates[surveyIndexMod] !== undefined) {
            changeDate(tempIndex.dates[surveyIndexMod].date);
          }

          //if the next survey is not defined move to the next month
          if (tempIndex.dates[surveyIndexMod] === undefined) {
            tempIndex = surveys[monthIndexMod];
            if (tempIndex !== undefined) changeDate(tempIndex.dates[0].date);
          }
          //is the month were moving to the expanded month
        } else if (
          surveys[monthIndexMod] &&
          surveys[monthIndexMod].monthName === expandedAccordian &&
          expandedAccordian.length > 0
        ) {
          tempIndex = surveys[monthIndexMod];
          if (tempIndex !== undefined) {
            monthIndexMod < monthIndex
              ? changeDate(tempIndex.dates[tempIndex.dates.length - 1].date)
              : changeDate(tempIndex.dates[0].date);
          }
          //neither of the above cases just move to the next month
        } else {
          tempIndex = surveys[monthIndexMod];
          if (tempIndex !== undefined) changeDate(tempIndex.dates[0].date);
        }
      }
    });
  };

  const showLatestSurveyInMonth = (month: SurveyMonth, event: any): void => {
    const useDate: any[] = [];
    allSurveys.forEach((survey: SurveyMonth) => {
      if (month.monthName === survey.monthName) {
        month.dates.forEach((date: SurveyDate) => {
          for (let i = 0; i < survey.dates.length; i++) {
            if (date.survey_name === survey.dates[i].survey_name) {
              useDate.push(survey.dates[i].date);
            }
          }
        });
      }
    });

    event.stopPropagation();
    changeDate(useDate[0]);
    setCurrentMonthName(month.monthName);
  };

  const changeDate = async (date: Date): Promise<void> => {
    props.changeDateAndUpdateFloors(date);
    setCurrentMonthName(
      date.toLocaleString("en-us", { month: "short", year: "numeric" }),
    );
  };

  return (
    <div className={`scrollControl ${!props.floorExists && "timelineHidden"}`}>
      <Drawer
        variant="persistent"
        anchor="right"
        open={props.timelineOpen}
        className={TimelineStyles.drawer}
      >
        <div
          className={TimelineStyles.drawerContainer}
          id="drawer-container"
          data-cy="timeline-drawer-container"
        >
          {updateSurveysJSX(surveys, allSurveys)}
        </div>
      </Drawer>
    </div>
  );
}

export default Timeline;
