import React from 'react';

const StatCard = ({ title, value, icon, bgColor, textColor }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl hover:scale-105 duration-200">
      <div className="p-6 flex items-center">
        <div className={`flex-shrink-0 ${bgColor} rounded-full p-4 shadow-lg`}>
          {icon}
        </div>
        <div className="ml-6 w-0 flex-1">
          <dl>
            <dt className="text-base font-semibold text-gray-700 mb-1">{title}</dt>
            <dd>
              <div className={`text-2xl font-extrabold ${textColor || 'text-blue-700'} drop-shadow-sm`}>{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatCard;