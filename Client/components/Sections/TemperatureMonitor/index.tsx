import React, { FC, useEffect } from "react";
import { Dimensions, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { LineChart } from "react-native-gifted-charts";
import { LineChart } from "react-native-chart-kit";
import { useTemperatureHistory } from "@/hooks/useTemperatureHistory";

export interface TemperatureMonitorProps {}

const TemperatureMonitor: FC<TemperatureMonitorProps> = (props) => {
  // const {} = useController();
  const { history, refresh } = useTemperatureHistory();
  console.log({ history });
  useEffect(()=>{
    refresh();
  } , [])
  return (
    <SafeAreaView>
      <Text style={{ width: "100%", textAlign: "center" }}>
        Temperature Monitor
      </Text>
      {/*<LineChart*/}
      {/*  adjustToWidth*/}
      {/*  areaChart*/}
      {/*  curved*/}
      {/*  isAnimated*/}
      {/*  animationDuration={1200}*/}
      {/*  startFillColor="#0BA5A4"*/}
      {/*  startOpacity={1}*/}
      {/*  endOpacity={0.3}*/}
      {/*  initialSpacing={0}*/}
      {/*  data={lineData}*/}
      {/*  spacing={40}*/}
      {/*  thickness={5}*/}
      {/*  yAxisColor="#0BA5A4"*/}
      {/*  hideDataPoints*/}
      {/*  animateOnDataChange*/}
      {/*  // showVerticalLines*/}
      {/*  showDataPointLabelOnFocus*/}
      {/*  verticalLinesColor="rgba(14,164,164,0.5)"*/}
      {/*  xAxisColor="#0BA5A4"*/}
      {/*  color="#0BA5A4"*/}
      {/*/>*/}
      <LineChart
        data={{
          labels: [],
          datasets: [
            {
              data: [
                Math.random() * 10,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
              ],
            },
          ],
        }}
        width={Dimensions.get("window").width} // from react-native
        height={220}
        yAxisLabel="$"
        yAxisSuffix="k"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </SafeAreaView>
  );
};

export default TemperatureMonitor;
