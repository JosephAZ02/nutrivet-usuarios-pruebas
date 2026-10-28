
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
  currency?: boolean;
}



function Chart({ data, type, currency }: ChartProps) {
  const currencyFormatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  });
  const formatValue = (value: number) =>
    currency ? currencyFormatter.format(value) : value.toLocaleString("es-CR");

  return type === "vertical" ? (
    <BarChart
      style={{
        width: '80%',
        maxWidth: '400px',
        maxHeight: '70vh',
        aspectRatio: 1.618,
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
      <CartesianGrid />
      <XAxis type="category" dataKey="label" />
      <YAxis type="number" tickFormatter={(value) => formatValue(Number(value))} />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" name="total" radius={[10, 10, 0, 0]} />
    </BarChart>
  ) : (
    <BarChart
      style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '70vh',
        aspectRatio: 1.618,
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
      <CartesianGrid />
      <XAxis type="number" tickFormatter={(value) => formatValue(Number(value))} />
      <YAxis type="category" dataKey="label" />
      <Tooltip
      />
      <Legend />
      <Bar dataKey="value" name="total" radius={[10, 10, 0, 0]} />
    </BarChart>
  )
}


export default Chart;