import React, { useState, useEffect, useMemo } from "react";
import { Chart } from "react-charts";
import { getFromNode } from "../services/linker";

export default (props) => {
  const [graphData, setData] = useState(null);
  const [graphType] = useState(localStorage.getItem("graphType"));

  const primaryAxis = useMemo(
    () => ({
      getValue: (datum) => datum.date,
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum) => datum.total,
      },
    ],
    []
  );

  useEffect(() => {
    async function getData() {
      let coinList = props.coinList;
      let dataList = [];

      let requestType =
        graphType === "quantity"
          ? "getCoinHistoryFormated"
          : "getCoinHistoryFormatedUSDT";

      for (let coin of coinList) {
        let dataCoin = await getFromNode(requestType, coin);
        if (dataCoin != null) {
          dataList.push(dataCoin);
        }
      }
      if (dataList.length > 0) {
        setData(dataList);
      }
    }
    getData();
  }, [props.coinList]);

  if (
    graphData != null &&
    graphData[0] != null &&
    graphData[0].data != null &&
    graphData[0].data.length > 0
  ) {
    let data = graphData;
    if (data.length == 1) {
      let defaultData = {
        label: "Default",
        data: [{ date: new Date(), total: 1 }],
      };
      data.push(defaultData);
    }

    return (
      <Chart
        options={{
          data,
          primaryAxis,
          secondaryAxes,
        }}
      />
    );
  } else {
    return "";
  }
};
