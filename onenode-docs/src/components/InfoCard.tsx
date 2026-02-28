import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children, icon }) => {
  return (
    <div className="bg-black/5 border border-black/20 rounded-lg p-4 my-4">
      <div className="text-black font-semibold mb-2">
        {icon && `${icon} `}{title}
      </div>
      <div className="text-black/80 text-sm">
        {children}
      </div>
    </div>
  );
};

export default InfoCard; 