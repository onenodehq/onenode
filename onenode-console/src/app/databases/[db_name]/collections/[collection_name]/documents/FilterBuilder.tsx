"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { XMarkIcon, PlusIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useMonaco } from "@monaco-editor/react";

type FilterOperator = 
  | "equals" 
  | "not_equals" 
  | "greater_than" 
  | "less_than" 
  | "greater_than_equals" 
  | "less_than_equals" 
  | "in" 
  | "contains" 
  | "starts_with" 
  | "ends_with"
  | "exists";

interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

interface SortField {
  id: string;
  field: string;
  direction: 1 | -1; // 1 for ascending, -1 for descending
}

interface FilterBuilderProps {
  onApplyFilter: (filter: object, sort?: Array<[string, number]>) => void;
  fields?: string[];
  isQueryMode?: boolean;
}

// Map UI-friendly operator names to MongoDB operators
const operatorMappings: Record<FilterOperator, string | null> = {
  equals: null, // direct field: value assignment
  not_equals: "$ne",
  greater_than: "$gt",
  less_than: "$lt",
  greater_than_equals: "$gte",
  less_than_equals: "$lte",
  in: "$in",
  contains: "$regex",
  starts_with: "$regex",
  ends_with: "$regex",
  exists: "$exists"
};

// Operator help text to guide users
const operatorHelpText: Record<FilterOperator, string> = {
  equals: "Value matches exactly",
  not_equals: "Value does not match",
  greater_than: "Value is greater than specified number",
  less_than: "Value is less than specified number",
  greater_than_equals: "Value is greater than or equal to specified number",
  less_than_equals: "Value is less than or equal to specified number",
  in: "Value is in the specified array (e.g. [1, 2, 3])",
  contains: "Text contains the specified value",
  starts_with: "Text starts with the specified value",
  ends_with: "Text ends with the specified value",
  exists: "Field exists (use 'true' or 'false')"
};

// Helper to parse a value based on what it looks like
const parseValueByType = (value: string): any => {
  // Try to parse as number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }
  
  // Check for boolean values
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  
  // Check for array syntax [val1, val2, ...]
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, return as string
      return value;
    }
  }
  
  // Default to string
  return value;
};

export default function FilterBuilder({ onApplyFilter, fields = [], isQueryMode = false }: FilterBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>(fields);
  const [hoveredOperator, setHoveredOperator] = useState<FilterOperator | null>(null);
  const [sortFields, setSortFields] = useState<SortField[]>([]);

  // Update available fields when they change in props
  useEffect(() => {
    if (fields.length > 0) {
      setAvailableFields(fields);
    }
  }, [fields]);

  // Build the MongoDB query object from the conditions
  const buildQueryObject = useCallback((): object => {
    if (conditions.length === 0) return {};

    const query: Record<string, any> = {};

    conditions.forEach(condition => {
      if (!condition.field) return; // Skip if no field specified
      
      const operator = operatorMappings[condition.operator];
      let value = parseValueByType(condition.value);

      if (condition.operator === "exists") {
        value = value === "true" || value === true;
      }
      
      // Special handling for regex operators
      if (condition.operator === "contains") {
        query[condition.field] = { $regex: value, $options: "i" };
      } else if (condition.operator === "starts_with") {
        query[condition.field] = { $regex: `^${value}`, $options: "i" };
      } else if (condition.operator === "ends_with") {
        query[condition.field] = { $regex: `${value}$`, $options: "i" };
      } else if (operator) {
        // Use MongoDB operator
        query[condition.field] = { [operator]: value };
      } else {
        // Direct assignment for "equals"
        query[condition.field] = value;
      }
    });

    return query;
  }, [conditions]);

  // Generate a unique ID for each condition
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: generateId(),
      field: "",
      operator: "equals",
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  const updateCondition = (
    id: string,
    field: keyof FilterCondition,
    value: string | FilterOperator
  ) => {
    setConditions(
      conditions.map(condition => 
        condition.id === id 
          ? { ...condition, [field]: value } 
          : condition
      )
    );
  };

  // Add a sort field
  const addSortField = () => {
    const newSortField: SortField = {
      id: generateId(),
      field: "",
      direction: 1,
    };
    setSortFields([...sortFields, newSortField]);
  };

  // Remove a sort field
  const removeSortField = (id: string) => {
    setSortFields(sortFields.filter(field => field.id !== id));
  };

  // Update a sort field
  const updateSortField = (
    id: string,
    key: keyof SortField,
    value: string | number
  ) => {
    setSortFields(
      sortFields.map(field => 
        field.id === id 
          ? { ...field, [key]: key === 'direction' ? (value as 1 | -1) : value } 
          : field
      )
    );
  };

  // Convert sort fields to MongoDB sort array
  const buildSortArray = (): Array<[string, number]> => {
    return sortFields
      .filter(field => field.field) // Filter out empty fields
      .map(field => [field.field, field.direction]);
  };

  const handleApplyFilter = () => {
    const filter = buildQueryObject();
    const sort = buildSortArray();
    onApplyFilter(filter, sort);
  };

  const handleClearFilter = () => {
    setConditions([]);
    setSortFields([]);
    onApplyFilter({}, []);
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800">
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer bg-gray-50 dark:bg-gray-900/20"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Filter Builder
        </h3>
        <button 
          className={`text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition ${isExpanded ? 'rotate-180' : ''}`}
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3 flex justify-end">
            <div className="flex space-x-2">
              <button
                onClick={handleClearFilter}
                className="text-xs px-2.5 py-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilter}
                className="text-xs px-2.5 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm transition"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="px-4 pb-4 space-y-4">
            {/* Conditions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Conditions</h4>
                <button
                  onClick={addCondition}
                  className="inline-flex items-center px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm transition"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Filter
                </button>
              </div>

              {conditions.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  No filters added yet. Click &quot;Add Filter&quot; to create one.
                </div>
              ) : (
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <div 
                      key={condition.id} 
                      className="p-2.5 bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-lg relative group"
                    >
                      <button
                        onClick={() => removeCondition(condition.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black border border-gray-200 dark:border-gray-700 transition"
                      >
                        <XMarkIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                      </button>
                      
                      <div className="flex flex-col space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Field
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              list={`fieldlist-${condition.id}`}
                              value={condition.field}
                              onChange={(e) =>
                                updateCondition(condition.id, "field", e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:border-gray-700 dark:text-white"
                              placeholder="Field name"
                            />
                            <datalist id={`fieldlist-${condition.id}`}>
                              {availableFields.map((field) => (
                                <option key={field} value={field} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 relative flex items-center">
                              Operator
                              <InformationCircleIcon 
                                className="h-3 w-3 text-gray-400 ml-1 cursor-help"
                                onMouseEnter={() => setHoveredOperator(condition.operator)}
                                onMouseLeave={() => setHoveredOperator(null)}
                              />
                              {hoveredOperator && (
                                <div className="absolute bottom-full left-0 z-10 mb-1 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                                  {operatorHelpText[hoveredOperator]}
                                </div>
                              )}
                            </label>
                            <select
                              value={condition.operator}
                              onChange={(e) =>
                                updateCondition(
                                  condition.id,
                                  "operator",
                                  e.target.value as FilterOperator
                                )
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:border-gray-700 dark:text-white"
                            >
                              <option value="equals">equals</option>
                              <option value="not_equals">not equals</option>
                              <option value="greater_than">&gt;</option>
                              <option value="less_than">&lt;</option>
                              <option value="greater_than_equals">≥</option>
                              <option value="less_than_equals">≤</option>
                              <option value="in">in array</option>
                              <option value="contains">contains</option>
                              <option value="starts_with">starts with</option>
                              <option value="ends_with">ends with</option>
                              <option value="exists">exists</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) =>
                                updateCondition(condition.id, "value", e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:border-gray-700 dark:text-white"
                              placeholder={condition.operator === "exists" ? "true/false" : "Value"}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Options - Always visible now */}
            <div className={`pt-3 ${sortFields.length > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Sort Options</h4>
                <button
                  onClick={addSortField}
                  className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-sm transition"
                >
                  <ArrowsUpDownIcon className="h-3 w-3 mr-1" />
                  Add Sort
                </button>
              </div>

              {sortFields.length > 0 && (
                <div className="space-y-2">
                  {sortFields.map((sortField) => (
                    <div
                      key={sortField.id}
                      className="p-2.5 bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-lg relative group"
                    >
                      <button
                        onClick={() => removeSortField(sortField.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black border border-gray-200 dark:border-gray-700 transition"
                      >
                        <XMarkIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                      </button>
                      
                      <div className="flex flex-col space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Field
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              list={`sortfieldlist-${sortField.id}`}
                              value={sortField.field}
                              onChange={(e) =>
                                updateSortField(sortField.id, "field", e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:border-gray-700 dark:text-white"
                              placeholder="Field name"
                            />
                            <datalist id={`sortfieldlist-${sortField.id}`}>
                              {availableFields.map((field) => (
                                <option key={field} value={field} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Direction
                          </label>
                          <div className="flex space-x-1">
                            <button
                              className={`flex-1 flex items-center justify-center px-2 py-1.5 text-xs rounded-full transition ${
                                sortField.direction === 1
                                  ? "bg-blue-500 text-white"
                                  : "bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                              onClick={() => updateSortField(sortField.id, "direction", 1)}
                            >
                              <ArrowUpIcon className="h-3 w-3 mr-1" />
                              Asc
                            </button>
                            <button
                              className={`flex-1 flex items-center justify-center px-2 py-1.5 text-xs rounded-full transition ${
                                sortField.direction === -1
                                  ? "bg-blue-500 text-white"
                                  : "bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                              onClick={() => updateSortField(sortField.id, "direction", -1)}
                            >
                              <ArrowDownIcon className="h-3 w-3 mr-1" />
                              Desc
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 