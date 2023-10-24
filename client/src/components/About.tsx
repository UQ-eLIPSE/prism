import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import DocumentationStyles from "../sass/partials/_documentation.module.scss";
import NetworkCalls from "../utils/NetworkCalls";

interface AboutProps {
  siteId: string;
}

function About(props: AboutProps) {
  const [info, setInfo] = useState<string>("");
  const abortController = new AbortController();
  useEffect(() => {
    fetchAboutInfo();
  }, []);

  async function fetchAboutInfo(): Promise<void> {
    try {
      const res = await NetworkCalls.fetchAboutInfo(
        props.siteId,
        abortController,
      );
      setInfo(res.info);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <Grid container className={DocumentationStyles.grid}>
      <Grid item xs={11} className={DocumentationStyles.gridItemFirst}>
        <div dangerouslySetInnerHTML={{ __html: info }} />
      </Grid>
    </Grid>
  );
}

export default About;
