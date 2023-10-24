import React, { Component } from "react";

// Material UI Components
import {
  createStyles,
  createTheme,
  MuiThemeProvider,
} from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";

// Styling
import variables from "../sass/partials/_variables";

// TODO: does this need to be exported
export interface FaqData {
  title: string;
  content: string;
}

const theme = createTheme({
  overrides: {
    MuiExpansionPanel: {
      root: {
        "&:before": {
          display: "none",
        },
      },
    },

    MuiCollapse: {
      wrapper: {
        marginBottom: "15px",
        marginTop: "-10px",
      },
    },

    MuiExpansionPanelDetails: {
      root: {
        padding: "8px 24px",
      },
    },

    MuiPaper: {
      elevation1: {
        backgroundColor: "transparent",
        borderBottom: variables.border,
        boxShadow: "none",
      },
    },

    MuiIconButton: {
      root: {
        color: variables.lightText,
      },
    },

    MuiTypography: {
      body1: {
        color: variables.text,
        fontFamily: "Lato, Helvetica, sans-serif",
        fontSize: "1.15em",
        fontWeight: 500,
        userSelect: "text",
      },

      h6: {
        color: variables.darkText,
        fontFamily: "Lexend Deca, sans-serif",
        fontSize: "1.9em",
        marginLeft: "-0.4em",
        marginBottom: "0.85em",
        userSelect: "text",
      },
    },
  },
});

export interface IFaqProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classes: any;
}

export interface IFaqState {
  faqs: FaqData[];
}

class Faq extends Component<IFaqProps, IFaqState> {
  public state = {
    faqs: [] as FaqData[],
  };

  private getFaqs(): void {
    fetch("https://38d08177-4ebe-4756-a163-e8abaf3d30e8.mock.pstmn.io/faqs")
      .then((response) => response.json())
      .then((data) => this.setState({ faqs: data.faqs }));
  }

  public componentDidMount(): void {
    this.getFaqs();
  }

  private getFaqsJSX(headingClass: string): React.ReactElement[] {
    return this.state.faqs.map((faq, index) => (
      <ExpansionPanel key={index}>
        <ExpansionPanelSummary
          expandIcon={<Icon className="fa fa-chevron-down" />}
        >
          <Typography className={headingClass} data-cy="accordion-item">
            {faq.title}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>{faq.content}</Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    ));
  }

  public render() {
    const { classes } = this.props;
    return (
      <Grid container className={classes.grid}>
        <Grid item xs={10}>
          <MuiThemeProvider theme={theme}>
            <Typography variant="h6">FAQ</Typography>
            {this.state.faqs && this.getFaqsJSX(classes.headingClass)}
          </MuiThemeProvider>
        </Grid>
      </Grid>
    );
  }
}

// Due to a current limitation of TypeScript decorators, withStyles(styles)
// from Material-UI can't be used as a decorator in TypeScript.
// Instead this work around has been implemented.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function styles(): any {
  return createStyles({
    root: {
      alignItems: "center",
      flexGrow: 1,
      fontFamily: "Lato, Helvetica, sans-serif",
      height: "100vh",
      justifyContent: "center",
      position: "relative",
    },

    grid: {
      alignItems: "center",
      backgroundColor: variables.background,
      height: "100vh",
      justifyContent: "center",
      overflowY: "scroll",
      zIndex: 100,
    },

    heading: {
      color: variables.darkText,
      fontSize: theme.typography.pxToRem(18),
      fontWeight: 500,
    },
  });
}

export default withStyles(styles)(Faq);
