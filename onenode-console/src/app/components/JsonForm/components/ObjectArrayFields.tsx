import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import FieldContainer from './FieldContainer';
import styles from '../styles.module.css';
import { useJsonForm } from '../context/JsonFormContext';
import { shouldSkipField } from '../FormNode';

interface ObjectArrayFieldsProps {
  data: any;
  isObject: boolean;
  isArray: boolean;
}

const ObjectArrayFields: React.FC<ObjectArrayFieldsProps> = ({
  data,
  isObject,
  isArray,
}) => {
  const { path, fieldOperations, readOnly } = useJsonForm();
  
  if (!isObject && !isArray) return null;

  return (
    <>
      {isArray ? (
        <>
          {data.map((value: any, index: number) => (
            <FieldContainer
              key={index}
              index={index}
              value={value}
            />
          ))}
        </>
      ) : (
        <>
          {Object.entries(data)
            .filter(([key]) => !shouldSkipField(key))
            .map(([key, value]) => (
              <FieldContainer
                key={key}
                index={key}
                value={value}
              />
            ))}
        </>
      )}
    </>
  );
};

export default ObjectArrayFields; 