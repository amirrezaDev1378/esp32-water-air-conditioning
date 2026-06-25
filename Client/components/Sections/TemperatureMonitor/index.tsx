import React, { FC, useMemo } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTemperatureHistory } from "@/hooks/useTemperatureHistory";
import { LineChart } from "react-native-chart-kit";

export interface TemperatureMonitorProps {}

const TemperatureMonitor: FC<TemperatureMonitorProps> = () => {
  const { history, isLoading } = useTemperatureHistory();

  const chartData = useMemo(() => {
    if (!history || !history?.ok || !((history?.items.length || -1) > 1))
      return;
    const sorted = history.items.sort((a, b) => a.temp - b.temp);
    const values = history.items.map((item) => item.temp);
    const minTemp = sorted[0];
    const maxTemp = sorted[sorted.length - 2];

    return {
      values,
      minTemp,
      maxTemp,
      sensorOk: history.sensorOk,
      count: history.count,
    };
  }, [history]);
  console.log({ chartData });
  console.log(history?.items.length);
  if (isLoading) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ height: 350 , paddingInline:24 }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: "600",
          marginVertical: 16,
        }}
      >
        Temperature Monitor
      </Text>
      {!!chartData && (
        <View>
          {!!chartData.maxTemp && !!chartData.minTemp && (
            <>
              <Text>
                Minimum Temperature :{" "}
                {new Date(chartData.minTemp.ts * 1000).toLocaleTimeString("en")}{" "}
                : {chartData.minTemp.temp}
              </Text>
              <Text>
                Maximum Temperature :{" "}
                {new Date(chartData.maxTemp.ts * 1000).toLocaleTimeString("en")}{" "}
                : {chartData.maxTemp.temp}
              </Text>
              <Text>
                Temperature Senor Status :{" "}
                {chartData.sensorOk ? "Working." : "Not Working!"}
              </Text>
            </>
          )}
        </View>
      )}
      {!!chartData && (
        <ScrollView
          style={{ height: "auto",  }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        >
          <LineChart
            withDots={false}
            data={{
              labels: [],
              datasets: [
                {
                  data: chartData.values,
                },
              ],
            }}
            width={
              Dimensions.get("window").width *
              (chartData.values.length >= 50 ? 2 : 1)
            }
            height={220}
            // yAxisLabel="C"
            yAxisSuffix=" C"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 1, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "0",
                strokeWidth: "0",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              position: "relative",
            }}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default TemperatureMonitor;
