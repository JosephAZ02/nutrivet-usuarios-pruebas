import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartItem {
  label: string | number;
  value: number;
}

interface ChartProps {
  data: ChartItem[];
  type: "vertical" | "horizontal";

}

function Chart({ data, type }: ChartProps) {
  // formato corto 
  const compactFormatter = new Intl.NumberFormat("es-CR", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const axisFormat = (value: number) =>
    ("₡") + compactFormatter.format(value);

  // formato completo para el tooltip 
  const currencyFormatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  });
  const formatValue = (value: number) => currencyFormatter.format(value);



  return type === "vertical" ? (
    <BarChart
      style={{
        width: '100%',
        maxWidth: '760px',
        maxHeight: '420px',
        aspectRatio: 1.618,
        margin: '0 auto',
      }}
      responsive
      data={data}
      layout="horizontal"
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid stroke="#686767" strokeDasharray="4 4" vertical={false} />
      <XAxis style={{ fontSize: "0.8rem" }} type="category" dataKey="label" tickLine={false} axisLine={false} />
      <YAxis
        type="number"
        tickFormatter={(value) => axisFormat(Number(value))}
        width={70}
        tickLine={false}
        axisLine={false}
        style={{ fontSize: "0.8rem" }}
      />
      <Tooltip formatter={(value) => [formatValue(Number(value)), "Total"]} />
      <Bar fill='#1f9d6b' dataKey="value" name="total" radius={[10, 10, 0, 0]} />
    </BarChart>
  ) : (
    <BarChart
      style={{
        width: '100%',
        maxWidth: '760px',
        maxHeight: '300px',
        aspectRatio: 2,
        margin: '0 auto',
      }}
      responsive
      data={data}
      layout="vertical"
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid stroke="#686767" strokeDasharray="4 4" horizontal={false} />
      <XAxis
        type="number"
        tickFormatter={(value) => axisFormat(Number(value))}
        tickLine={false}
        axisLine={false}
        style={{ fontSize: "0.8rem" }}
      />
      <YAxis type="category" dataKey="label" tickLine={false} axisLine={false}
        width={120}
        style={{ fontSize: "0.8rem" }}
      />
      <Tooltip formatter={(value) => [formatValue(Number(value)), "Total"]} />
      <Legend />
      <Bar fill='#1f9d6b' dataKey="value" name="total" radius={[0, 10, 10, 0]} />
    </BarChart>
  )
}

export default Chart;