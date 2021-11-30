import React, { useState, useEffect, useMemo } from "react";
import { Chart } from "react-charts";
import { getFromNode } from "../services/linker";

export default (props) => {
  const [data, setData] = useState(null);
  const primaryAxis = React.useMemo(
    () => ({
      getValue: (datum) => datum.date,
    }),
    []
  );

  const secondaryAxes = React.useMemo(
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

      for (let coin of coinList) {
        let dataCoin = await getFromNode("getCoinHistory", coin);
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

  if (data == null) {
    return "";
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
};
