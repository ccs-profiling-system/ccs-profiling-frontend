import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function BarChart({ data, dataKey = 'value', xAxisKey = 'name', height = 300, color = 'rgb(234, 88, 12)' // primary color
 }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(RechartsBarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }), _jsx(XAxis, { dataKey: xAxisKey, tick: { fill: '#6b7280', fontSize: 12 }, stroke: "#9ca3af" }), _jsx(YAxis, { tick: { fill: '#6b7280', fontSize: 12 }, stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: {
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }, cursor: { fill: 'rgba(234, 88, 12, 0.1)' } }), _jsx(Bar, { dataKey: dataKey, fill: color, radius: [8, 8, 0, 0] })] }) }));
}
