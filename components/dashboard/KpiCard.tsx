interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">

      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h2 className="text-3xl font-bold text-gray-800 mt-2">
          {value}
        </h2>
      </div>

      <div
        className={`${color} w-14 h-14 rounded-full flex items-center justify-center text-white`}
      >
        {icon}
      </div>

    </div>
  );
}