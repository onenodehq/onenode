import React from 'react';
import { renderValueDisplay } from '../helper';
import styles from '../styles.module.css';

interface ValueDisplayProps {
  data: any;
  dataType: string;
  truncateStrings: boolean;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  data,
  dataType,
  truncateStrings
}) => {
  return (
    <span className={`${styles[`${dataType}Value`]}`}>
      {renderValueDisplay(data, truncateStrings)}
    </span>
  );
};

export default ValueDisplay; 