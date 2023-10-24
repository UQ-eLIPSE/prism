import React from "react";
import Grid from "@material-ui/core/Grid";
import HomeStyles from "../sass/partials/_home.module.scss";

interface Props {
  title: string;
  backgroundImage: string;
}

export default function Home(props: Props) {
  return (
    <Grid container className={HomeStyles.grid}>
      <h1 className={HomeStyles.title}>{props.title}</h1>
      <img
        src={props.backgroundImage}
        className={HomeStyles.image}
        alt="ANLB Building"
      />
    </Grid>
  );
}
