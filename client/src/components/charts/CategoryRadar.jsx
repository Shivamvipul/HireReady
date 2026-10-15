import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function CategoryRadar({ scores }) {
  const data = Object.entries(scores || {}).map(([k, v]) => ({ k: k[0].toUpperCase() + k.slice(1), v }));
  return (
    <div className="h-64 w-full" role="img" aria-label={`Category scores: ${data.map((d) => `${d.k} ${d.v}`).join(', ')}`}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#dbe4de" />
          <PolarAngleAxis dataKey="k" tick={{ fill: '#62736d', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="v" stroke="#176c5d" fill="#176c5d" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
