import React from 'react';
import Chart from 'react-apexcharts';

const LineChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <Chart
      type="line"
      height={350}
      series={data.series}
      options={data.options || { chart: { id: 'line-chart' }, xaxis: { categories: [1, 2, 3, 4, 5, 6, 7] } }}
    />
  );
};

export default LineChart;