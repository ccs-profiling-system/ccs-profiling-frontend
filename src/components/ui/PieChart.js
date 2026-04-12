import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
const DEFAULT_COLORS = [
    'rgb(234, 88, 12)', // primary
    'rgb(239, 68, 68)', // secondary
    'rgb(59, 130, 246)', // blue
    'rgb(16, 185, 129)', // green
    'rgb(168, 85, 247)', // purple
    'rgb(245, 158, 11)', // amber
];
export function PieChart({ data, height = 300, colors = DEFAULT_COLORS }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(RechartsPieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: (props) => {
                        const name = props.name ?? '';
                        const percent = props.percent ?? 0;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: data.map((_, index) => (_jsx(Cell, { fill: colors[index % colors.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    } }), _jsx(Legend, { verticalAlign: "bottom", height: 36, iconType: "circle" })] }) }));
}
