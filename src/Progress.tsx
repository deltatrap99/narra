import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Clock3, FileSearch, Flame, MessageCircle, Star } from 'lucide-react';
import type { Word } from './data';
import { activityStreak, localDateKey, useCopy } from './state';

export type ProgressStats = {
  minutes: number;
  conversations: number;
  reviews: number;
  speakingTries: number;
  speakingScore: number;
  completed: string[];
  activity: { date: string; minutes: number; label: string; score?: number }[];
};

type Props = { stats: ProgressStats; words: Word[]; onWriting: () => void };
type Coordinate = [number, number];
type Feature = {
  properties: { name: string; code: string };
  geometry: { type: 'Polygon'; coordinates: Coordinate[][] } | { type: 'MultiPolygon'; coordinates: Coordinate[][][] };
};
type Metric = 'Index' | 'Minutes' | 'Days' | 'Speaking' | 'Words';
const metrics: Metric[] = ['Index', 'Minutes', 'Days', 'Speaking', 'Words'];
const mapColors = ['#c9eaa8', '#b7e5ee', '#ffd1a9', '#e0efc5', '#adddf3', '#ffe2bd', '#b1dc8b', '#bceee8'];
const labelPositions: Record<string, [number, number, number?, number?]> = {
  'Lai Châu': [72, 94], 'Điện Biên': [55, 135], 'Sơn La': [114, 165],
  'Lào Cai': [133, 118], 'Tuyên Quang': [175, 86], 'Cao Bằng': [227, 65],
  'Lạng Sơn': [270, 119], 'Thái Nguyên': [217, 132], 'Phú Thọ': [163, 184],
  'Hà Nội': [209, 171], 'Quảng Ninh': [315, 160], 'Bắc Ninh': [349, 190, 241, 152],
  'Hải Phòng': [349, 212, 244, 176], 'Hưng Yên': [349, 234, 233, 190],
  'Ninh Bình': [224, 211], 'Thanh Hoá': [183, 237], 'Nghệ An': [165, 278],
  'Hà Tĩnh': [209, 327], 'Quảng Trị': [247, 385], 'Huế': [294, 435],
  'Đà Nẵng': [319, 477], 'Quảng Ngãi': [327, 526], 'Gia Lai': [341, 575],
  'Đắk Lắk': [343, 627], 'Khánh Hoà': [390, 663], 'Lâm Đồng': [323, 692],
  'Đồng Nai': [275, 705], 'Tây Ninh': [211, 729], 'Hồ Chí Minh': [370, 753, 263, 725],
  'Đồng Tháp': [211, 756], 'Vĩnh Long': [248, 780], 'An Giang': [152, 773],
  'Cần Thơ': [207, 801], 'Cà Mau': [177, 835],
};

// The geographic asset is a simplified copy of TaliaCao's MIT-licensed 34-province
// GeoJSON. These comparison figures are intentionally local demonstration data.
function demoValue(index: number, metric: Metric) {
  const seed = ((index + 3) * 47) % 103;
  return metric === 'Minutes' ? 32 + seed * 4 : metric === 'Days' ? 3 + seed % 24
    : metric === 'Speaking' ? 55 + seed % 44 : metric === 'Words' ? 8 + seed : 35 + seed % 65;
}

function VietnamMap() {
  const tr = useCopy();
  const metricLabel = (value: Metric) => ({ Index: tr('Index', 'Chỉ số'), Minutes: tr('Minutes', 'Số phút'), Days: tr('Days', 'Số ngày'), Speaking: tr('Speaking', 'Luyện nói'), Words: tr('Words', 'Từ vựng') })[value];
  const [features, setFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [metric, setMetric] = useState<Metric>('Index');
  const [mode, setMode] = useState<'Provinces' | 'By index'>('Provinces');
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch('/assets/vietnam.geo.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Map unavailable'); return response.json(); })
      .then(data => setFeatures(data.features))
      .catch(err => { if (err.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [attempt]);
  const project = ([longitude, latitude]: Coordinate) => [(longitude - 102) * 51 + 16, (23.9 - latitude) * 55 + 10];
  const pathFor = (feature: Feature) => {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    return polygons.map(polygon => polygon.map(ring => ring.map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') + 'Z').join(' ')).join(' ');
  };
  const selectedIndex = features.findIndex(feature => feature.properties.name === selected);
  const ordered = useMemo(() => [...features].sort((a, b) =>
    demoValue(features.indexOf(b), metric) - demoValue(features.indexOf(a), metric)), [features, metric]);
  return <section className="card map-card">
    <h2>{tr('Your place on the map', 'Dấu ấn trên bản đồ')}</h2>
    <p className="muted">{tr('34 provinces and cities · last 28 days', '34 tỉnh thành · 28 ngày gần đây')}</p>
    <div className="chips" aria-label="Map metric">{metrics.map(item => <button key={item}
      className={`chip ${metric === item ? 'active' : ''}`} aria-pressed={metric === item}
      onClick={() => setMetric(item)}>{metricLabel(item)}</button>)}</div>
    <div className="chips map-view-switch" aria-label="Map view">{(['Provinces', 'By index'] as const).map(item =>
      <button key={item} className={`chip ${mode === item ? 'active' : ''}`} aria-pressed={mode === item}
        onClick={() => setMode(item)}>{item === 'Provinces' ? tr('Provinces', 'Tỉnh thành') : tr('By index', 'Theo chỉ số')}</button>)}</div>
    {error ? <div className="map-panel map-empty"><p>{tr("The map couldn't load.", 'Chưa tải được bản đồ.')}</p><button className="chip" onClick={() => setAttempt(value => value + 1)}>{tr('Try again', 'Thử lại')}</button></div>
      : features.length === 0 ? <div className="map-panel map-empty" role="status">{tr('Loading your map…', 'Đang tải bản đồ…')}</div>
        : mode === 'Provinces' ? <div className="map-panel">
          <svg className="vietnam-map" viewBox="0 0 540 875" aria-label="Interactive map of Vietnam's provinces">
            <title>Vietnam · select a province to see a demo comparison</title>
            {features.map((feature, index) => <path key={feature.properties.code} d={pathFor(feature)}
              className={`province ${selected === feature.properties.name ? 'selected' : ''}`}
              fill={selected === feature.properties.name ? 'var(--brand-lime, #9ce943)' : mapColors[index % mapColors.length]}
              stroke="white" strokeWidth="1.5" strokeLinejoin="round" role="button" tabIndex={0}
              aria-label={`${feature.properties.name}, demo ${metric.toLowerCase()} ${demoValue(index, metric)}`}
              onClick={() => setSelected(feature.properties.name)} onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(feature.properties.name); }
              }}><title>{feature.properties.name}</title></path>)}
            {features.map(feature => {
              const position = labelPositions[feature.properties.name];
              if (!position) return null;
              return <g key={`label-${feature.properties.code}`} className="map-label" aria-hidden="true">
                {position[2] !== undefined && <line x1={position[2]} y1={position[3]} x2={position[0] - 4} y2={position[1] - 4} stroke="#777280" strokeWidth=".8" />}
                <text x={position[0]} y={position[1]} textAnchor={position[2] ? 'start' : 'middle'}>{feature.properties.name}</text>
              </g>;
            })}
            <text x="457" y="410" className="island-label">Hoàng Sa</text>
            <text x="445" y="780" className="island-label">Trường Sa</text>
          </svg>
        </div> : <div className="province-ranking">{ordered.map((feature, rank) =>
          <button className="list-row" key={feature.properties.code} onClick={() => setSelected(feature.properties.name)}>
            <span className="muted">{String(rank + 1).padStart(2, '0')}</span><strong>{feature.properties.name}</strong>
            <span className="badge">{demoValue(features.indexOf(feature), metric)}{metric === 'Minutes' ? ' min' : ''}</span>
          </button>)}</div>}
    {selected && <div className="province-detail tone-lavender" role="status"><div><span className="eyebrow">{tr('DEMO COMPARISON', 'SO SÁNH MINH HỌA')}</span><h3>{selected}</h3></div>
      <strong>{demoValue(selectedIndex, metric)} <small>{metricLabel(metric).toLowerCase()}</small></strong></div>}
    <p className="muted map-caption">{tr('Each province has its own colour. Tap one to see its figures.', 'Mỗi tỉnh thành có một màu riêng. Chạm để xem số liệu.')}</p>
    <p className="muted map-disclaimer">{tr('Demo comparison · sample figures for exploring the interface.', 'So sánh minh họa · số liệu mẫu để trải nghiệm giao diện.')}</p>
    <a className="map-attribution" href="https://github.com/TaliaCao/Vietnam-Shape-Map" target="_blank" rel="noreferrer">Map geometry: TaliaCao · MIT</a>
  </section>;
}

function Calendar({ activity }: { activity: ProgressStats['activity'] }) {
  const tr = useCopy();
  const today = localDateKey();
  const month = today.slice(0, 7);
  const first = new Date(`${month}-01T12:00:00Z`);
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const emptyDays = (first.getUTCDay() + 6) % 7;
  const title = first.toLocaleDateString(tr('en-GB', 'vi-VN'), { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const [selected, setSelected] = useState(Number(today.slice(8)));
  const selectedActivity = activity.filter(item => item.date.slice(0, 10) === `${month}-${String(selected).padStart(2, '0')}`);
  return <section className="card progress-calendar">
    <h2>{title}</h2>
    <div className="calendar-grid" aria-label={tr('Activity calendar: ', 'Lịch luyện tập: ')+title}>
      {[tr('M', 'T2'), tr('T', 'T3'), tr('W', 'T4'), tr('T', 'T5'), tr('F', 'T6'), tr('S', 'T7'), tr('S', 'CN')].map((day, index) => <span key={`day-${index}`} className="calendar-weekday">{day}</span>)}
      {Array.from({ length: emptyDays }, (_, index) => <span key={`empty-${index}`} />)}
      {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => {
        const hasActivity = activity.some(item => item.date.slice(0, 10) === `${month}-${String(day).padStart(2, '0')}`);
        return <button key={day} className={`calendar-day ${selected === day ? 'selected' : ''} ${hasActivity ? 'has-activity' : ''}`}
          aria-label={`${day} ${title}${hasActivity ? tr(', practice recorded', ', đã luyện tập') : ''}`} aria-pressed={selected === day} onClick={() => setSelected(day)}>{day}</button>;
      })}
    </div>
    <p className="calendar-detail muted" role="status">{selected} · {selectedActivity.length
      ? `${selectedActivity.reduce((sum, item) => sum + item.minutes, 0)} ${tr('minutes of practice recorded', 'phút luyện tập được ghi nhận')}`
      : tr('No practice recorded on this day.', 'Chưa có hoạt động luyện tập trong ngày này.')}</p>
  </section>;
}

function WeeklyChart({ activity }: { activity: ProgressStats['activity'] }) {
  const tr = useCopy();
  const today = new Date(`${localDateKey()}T12:00:00Z`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today); day.setUTCDate(today.getUTCDate() - 6 + index);
    const date = day.toISOString().slice(0, 10);
    return { date, label: day.toLocaleDateString(tr('en', 'vi'), { weekday: 'short', timeZone: 'UTC' }), value: activity.filter(item => item.date.slice(0, 10) === date).reduce((sum, item) => sum + item.minutes, 0) };
  });
  const max = Math.max(6, ...days.map(day => day.value));
  return <section className="card"><h2>{tr('This week', 'Tuần này')}</h2><div className="weekly-chart">
    <svg viewBox="0 0 600 260" role="img" aria-label={`Practice minutes over the last seven days: ${days.map(day => `${day.date}: ${day.value}`).join(', ')}`}>
      {[0, 1, 2, 3].map(index => <g key={index}><line x1="4" x2="566" y1={220 - index * 66} y2={220 - index * 66} stroke="#dedde0" /><text x="579" y={225 - index * 66} fill="#929097" fontSize="15">{Math.round(max * index / 3)}</text></g>)}
      <line x1="4" x2="566" y1={220 - 5 / max * 198} y2={220 - 5 / max * 198} stroke="#8b8793" strokeWidth="1.5" strokeDasharray="6 7" />
      {days.map((day, index) => <g key={day.date}>{day.value > 0 && <rect x={22 + index * 78} y={220 - day.value / max * 198} width="27" height={day.value / max * 198} rx="8" fill="var(--brand-lime, #9ce943)" />}<text x={35 + index * 78} y="249" textAnchor="middle" fill="#929097" fontSize="15">{day.label}</text></g>)}
    </svg>
  </div></section>;
}

export default function Progress({ stats, words, onWriting }: Props) {
  const tr = useCopy();
  const mastered = words.filter(word => word.status === 'Mastered').length;
  const writingChecks = stats.activity.filter(item => item.label === 'Writing practice').length;
  const statCards = [
    { Icon: Flame, value: activityStreak(stats.activity), label: tr('day streak', 'ngày liên tục'), tone: 'peach' },
    { Icon: Clock3, value: stats.minutes, label: tr('minutes total', 'tổng số phút'), tone: 'green' },
    { Icon: MessageCircle, value: stats.conversations, label: tr('conversations', 'cuộc hội thoại'), tone: 'blue' },
    { Icon: Star, value: mastered, label: tr('words mastered', 'từ đã nắm vững'), tone: 'yellow' },
  ];
  return <div className="progress-page">
    <div className="page-intro"><h1>{tr('Your progress', 'Tiến độ của bạn')}</h1><p>{tr('Every conversation and practice try counts.', 'Mỗi cuộc hội thoại và lần luyện tập đều có ý nghĩa.')}</p></div>
    <div className="stat-grid">{statCards.map(({ Icon, value, label, tone }) =>
      <div key={label} className={`stat-card tone-${tone}`}><Icon aria-hidden="true" /><strong>{value}</strong><span className="muted">{label}</span></div>)}</div>
    <section className="card practice-record"><h2>{tr('Practice you’ve recorded', 'Hoạt động đã ghi nhận')}</h2><div className="record-grid">
      <div className="record-tile tone-lavender"><strong>{stats.speakingScore || '-'}</strong><p>{tr('Speaking score', 'Điểm luyện nói')}</p><span className="muted">{tr('Previous speaking record', 'Kết quả luyện nói trước đây')}</span></div>
      <div className="record-tile tone-lavender"><strong>{stats.speakingTries}</strong><p>{tr('Speaking tries', 'Lần luyện nói')}</p><span className="muted">{words.length} {tr('saved words to practise', 'từ đã lưu để luyện tập')}</span></div>
      <div className="record-tile tone-lavender"><strong>{stats.reviews}</strong><p>{tr('Word reviews', 'Lần ôn từ')}</p><span className="muted">{mastered} {tr('words mastered', 'từ đã nắm vững')}</span></div>
      <div className="record-tile tone-lavender"><strong>{writingChecks}</strong><p>{tr('Writing practice', 'Luyện viết')}</p><span className="muted">{tr('Local reviews recorded', 'Lần xem ghi chú trên thiết bị')}</span></div>
    </div></section>
    <VietnamMap />
    <div className="progress-history"><WeeklyChart activity={stats.activity} /><Calendar activity={stats.activity} /></div>
    <button className="writing-estimates tone-lavender" onClick={onWriting}><FileSearch aria-hidden="true" /><strong>{tr('Writing practice', 'Luyện viết')}</strong><ChevronRight aria-hidden="true" /></button>
    <section className="practice-log"><h2>{tr('Practice log', 'Nhật ký luyện tập')}</h2><div className="card">
      {stats.activity.length ? stats.activity.map((item, index) => <div className="list-row" key={`${item.date}-${index}`}>
        <span className="badge">{item.score !== undefined ? tr('Read aloud', 'Đọc thành tiếng') : tr('Practice', 'Luyện tập')}</span><span className="log-label">{item.label}</span>
        <strong>{item.score !== undefined ? item.score : `${item.minutes} ${tr('min', 'phút')}`}</strong><time className="muted" dateTime={item.date}>{new Date(`${item.date.slice(0, 10)}T12:00:00`).toLocaleDateString(tr('en-GB', 'vi-VN'), { day: 'numeric', month: 'short' })}</time>
      </div>) : <p className="muted">{tr('Your practice will appear here. A little every day adds up.', 'Các buổi luyện tập sẽ xuất hiện ở đây. Mỗi ngày một chút, tiến bộ thật nhiều.')}</p>}
    </div></section>
  </div>;
}
