import React from "react";

// Material UI Components
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import MaterialTable from "material-table";

// Styling
import variables from "../sass/partials/_variables";
import MediaStyles from "../sass/partials/_media.module.scss";

const theme = createTheme({
  overrides: {
    MuiIcon: {
      fontSizeSmall: {
        color: variables.lightText,
        fontSize: "1.75rem",
        fontWeight: 600,
      },
    },
    MuiInput: {
      input: {
        fontFamily: "Lato, Helvetica, sans-serif",
        fontSize: "larger",
      },
      underline: {
        "&:after": {
          borderBottom: "none",
        },
        "&:before": {
          borderBottom: "none",
        },
        "&:hover:not(.Mui-disabled):before": {
          borderBottom: "none",
        },
      },
    },
    MuiPaper: {
      elevation2: {
        boxShadow: "none",
        backgroundColor: "initial",
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: variables.border,
        "&:(lastChild)": {
          borderBottom: 0,
        },
      },
      body: {
        color: variables.text,
        fontFamily: "Lato, Helvetica, sans-serif",
        fontSize: "1em",
        fontWeight: 500,
      },
      footer: {
        borderBottom: 0,
      },
    },
    MuiTypography: {
      caption: {
        color: variables.text,
        fontFamily: "Lexend Deca, sans-serif",
        fontSize: "1.4em",
      },
      h6: {
        color: variables.darkText,
        fontFamily: "Lexend Deca, sans-serif",
        fontSize: "1.6em",
      },
    },
    MuiSelect: {
      select: {
        "&:focus": {
          backgroundColor: "transparent",
        },
      },
    },
    MuiTablePagination: {
      toolbar: {
        alignItems: "center",
        justifyContent: "space-between",
      },
      input: {
        height: "50px",
        fontSize: "1rem",
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 0px 2px #00000029",
        borderRadius: "10px",
        padding: "0 2px",
        margin: "22px",
        color: "#999",
        order: 3,
      },
      selectIcon: {
        color: "#999",
        right: "0.25em",
        top: "auto",
      },
      spacer: {
        flex: "initial",
        order: 1,
      },
      root: {
        "&:last-child": {
          paddingRight: "10px",
          paddingTop: "50px",
        },
      },
    },
  },
});

const mediaHeaders = [
  {
    title: "File Name",
    render: (data: { name: string; url: string }): React.ReactElement => {
      return (
        <a target="_blank" rel="noopener noreferrer" href={data.url}>
          {data.name}
        </a>
      );
    },
  },
  { title: "Description", field: "description" },
  { title: "Area", field: "areaName.name" },
  { title: "Category", field: "category.name" },
  { title: "Sub-Category", field: "subcategory.name" },
  { title: "Type", field: "resourceType.name" },
  { title: "Last Updated", field: "uploadedAt", type: "date" },
];

export interface IMediaProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classes: any;
  BASE_URL: string;
}

export default class Media extends React.Component<IMediaProps, object> {
  private tableOptions = {
    pageSize: 5,
    pageSizeOptions: [1, 5, 10],
    sorting: true,
    searchFieldStyle: {
      display: "none",
      backgroundColor: "white",
      borderRadius: "20px",
      boxShadow: "0px 0px 2px #00000029",
      color: variables.lightText,
      height: "45px",
      paddingLeft: "12px",
      width: "23.5em",
    },
    headerStyle: {
      backgroundColor: "initial",
      color: variables.darkText,
      fontFamily: "Lato, Helvetica, sans-serif",
      fontSize: "1.1em",
      fontWeight: 600,
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getResources = (query: any): Promise<any> => {
    return new Promise((resolve) => {
      fetch(
        this.props.BASE_URL +
          "/api/resources/" +
          (query.page + 1) +
          "?size=" +
          query.pageSize,
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          resolve({
            data: data.payload.resources,
            page: Number(data.payload.currentPage) - 1,
            totalCount: data.payload.totalCount,
          });
        });
    });
  };

  render() {
    return (
      <Grid container className={MediaStyles.grid}>
        <Grid item xs={10}>
          <MuiThemeProvider theme={theme}>
            <MaterialTable
              title="Media"
              columns={mediaHeaders}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={(query: any): Promise<any> => this.getResources(query)}
              options={this.tableOptions}
            />
          </MuiThemeProvider>
        </Grid>
      </Grid>
    );
  }
}
