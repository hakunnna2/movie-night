import { useMemo } from 'react';
import { MovieEntry } from '../types';
import { Calendar } from 'lucide-react';

interface MovieHeatmapProps {
  entries: MovieEntry[];
}

export const MovieHeatmap: React.FC<MovieHeatmapProps> = ({ entries }) => {
  const heatmapData = useMemo(() => {
    const watched = entries.filter(e => e.status === 'watched');
    const dateMap: Record<string, number> = {};

    watched.forEach(entry => {
      const dateKey = entry.date;
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });

    // Get last 12 months of data
    const today = new Date();
    const months: { week: number; day: number; date: Date; count: number }[][] = [];

    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const monthDays: { week: number; day: number; date: Date; count: number }[] = [];

      // Get first day of month and number of days
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      // Add empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        monthDays.push({ week: Math.floor(i / 7), day: i % 7, date: new Date(), count: 0 });
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const dateKey = cellDate.toISOString().split('T')[0];
        const count = dateMap[dateKey] || 0;

        monthDays.push({
          week: Math.floor((firstDay + day - 1) / 7),
          day: (firstDay + day - 1) % 7,
          date: cellDate,
          count
        });
      }

      months.push(monthDays);
    }

    return months;
  }, [entries]);

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-[#fbbf24]/30';
    if (count === 2) return 'bg-[#fbbf24]/60';
    return 'bg-[#fbbf24]';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-8 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <Calendar size={28} className="text-[#fbbf24]" />
        <h2 className="text-2xl font-black text-white tracking-tight">Movie Night Calendar</h2>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-8 text-[10px]">
        <span className="text-ink-400 font-bold">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-white/5"></div>
          <div className="w-3 h-3 rounded bg-[#fbbf24]/30"></div>
          <div className="w-3 h-3 rounded bg-[#fbbf24]/60"></div>
          <div className="w-3 h-3 rounded bg-[#fbbf24]"></div>
        </div>
        <span className="text-ink-400 font-bold">More</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="space-y-6 pb-4 min-w-max">
          {heatmapData.map((monthWeeks, monthIdx) => {
            const currentMonth = new Date();
            currentMonth.setMonth(currentMonth.getMonth() - (11 - monthIdx));
            const monthName = monthNames[currentMonth.getMonth()];

            return (
              <div key={monthIdx}>
                <p className="text-[10px] font-black text-ink-400 uppercase tracking-[0.2em] mb-2">{monthName}</p>
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 mr-2">
                    {dayNames.map((day) => (
                      <div key={day} className="w-6 h-6 flex items-center justify-center text-[8px] text-ink-400 font-bold">
                        {day.charAt(0)}
                      </div>
                    ))}
                  </div>

                  {/* Weeks */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.max(...monthWeeks.map(d => d.week)) + 1 }).map((_, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1">
                        {monthWeeks
                          .filter(d => d.week === weekIdx)
                          .map((day, idx) => (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded border border-white/10 transition-all hover:scale-125 cursor-pointer ${getColor(day.count)} ${
                                day.count > 0 ? 'shadow-lg hover:shadow-[0_0_8px_#fbbf24]' : ''
                              }`}
                              title={day.count > 0 ? `${day.count} movie${day.count > 1 ? 's' : ''} on ${day.date.toDateString()}` : day.date.toDateString()}
                            ></div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-white/10 mt-8 pt-6 text-sm text-ink-200">
        <p>
          🎬 You had <span className="text-[#fbbf24] font-black">{entries.filter(e => e.status === 'watched').length}</span> movie nights in the past year
        </p>
      </div>
    </div>
  );
};
