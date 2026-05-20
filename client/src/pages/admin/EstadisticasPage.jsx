import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { api } from '../../services/api.js';
import '../../styles/styles.css';
import '../../styles/admin.css';

function formatAxisDate(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

const DIAS_OPCIONES = [
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
];

function ChartPanel({ title, subtitle, children, tall = false }) {
  return (
    <section className="chart-panel">
      <h2 className="chart-panel__title">{title}</h2>
      {subtitle && <p className="chart-panel__subtitle">{subtitle}</p>}
      <div className={`chart-panel__body ${tall ? 'chart-panel__body--tall' : ''}`}>
        {children}
      </div>
    </section>
  );
}

export default function EstadisticasPage() {
  const [diasPeriodo, setDiasPeriodo] = useState(14);
  const [ventasStats, setVentasStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await api.get(
        `/api/pedido/estadisticas-ventas?dias=${diasPeriodo}`
      );
      const body = data?.body;
      if (!error && body?.porDia && body?.resumen) {
        setVentasStats(body);
      } else {
        setVentasStats(null);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [diasPeriodo]);

  const { chartVentas, chartAcumulado } = useMemo(() => {
    const raw = ventasStats?.porDia ?? [];
    const base = raw.map((row) => ({
      fecha: row.fecha,
      total: Number(row.total) || 0,
      label: formatAxisDate(row.fecha),
    }));

    const withAcum = base.reduce((accArr, row) => {
      const prev = accArr.length ? accArr[accArr.length - 1].acumulado : 0;
      const acumulado = Math.round((prev + row.total) * 100) / 100;
      accArr.push({ ...row, acumulado });
      return accArr;
    }, []);

    return { chartVentas: base, chartAcumulado: withAcum };
  }, [ventasStats]);

  const resumen = ventasStats?.resumen;
  const topPlatillosChart = useMemo(() => {
    const list = resumen?.topPlatillos ?? [];
    return [...list].reverse().map((p) => ({
      ...p,
      etiqueta:
        p.nombre.length > 22 ? `${p.nombre.slice(0, 20)}…` : p.nombre,
    }));
  }, [resumen]);

  const hayVentas = chartVentas.some((r) => r.total > 0);
  return (
    <div className="page-content estadisticas-page">
      <h1 className="estadisticas__title">Estadísticas</h1>
      <div className="estadisticas__toolbar">
        <label className="estadisticas__label">
          <span className="estadisticas__labelText">Período</span>
          <select
            value={diasPeriodo}
            onChange={(e) => setDiasPeriodo(Number(e.target.value))}
            className="estadisticas__select"
          >
            {DIAS_OPCIONES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="estadisticas__grid">
        <ChartPanel title="Ventas por día" subtitle="Importe por fecha">
          {chartVentas.length > 0 && hayVentas ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartVentas}
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.35} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={48} />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Ventas']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fecha
                      ? formatAxisDate(payload[0].payload.fecha)
                      : ''
                  }
                />
                <Bar dataKey="total" fill="#27ae60" radius={[4, 4, 0, 0]} name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">No hay datos de ventas en este período.</p>
          )}
        </ChartPanel>

        <ChartPanel title="Ventas acumuladas" subtitle="Suma progresiva en el período">
          {chartAcumulado.length > 0 && hayVentas ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartAcumulado}
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.35} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={48} />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Acumulado']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fecha
                      ? formatAxisDate(payload[0].payload.fecha)
                      : ''
                  }
                />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#1e8449"
                  strokeWidth={2}
                  dot={{ fill: '#27ae60', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Acumulado"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Sin serie temporal todavía.</p>
          )}
        </ChartPanel>
      </div>

      <ChartPanel
        title="Platillos más vendidos"
        subtitle="Por importe en el período"
        tall
      >
        {topPlatillosChart.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topPlatillosChart}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.35} horizontal />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="etiqueta" width={140} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, name) => {
                  if (name === 'monto') return [`$${Number(v).toFixed(2)}`, 'Importe'];
                  return [v, name];
                }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.nombre ?? ''}
              />
              <Bar dataKey="monto" fill="#8e44ad" radius={[0, 4, 4, 0]} name="Importe" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">Sin datos de platillos en el período.</p>
        )}
      </ChartPanel>
    </div>
  );
}
