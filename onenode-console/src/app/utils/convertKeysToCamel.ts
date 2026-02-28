function snakeToCamel(snakeCase: string): string {
    return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  
  export function convertKeysToCamel(
    obj: Record<string, any>
  ): Record<string, any> {
    if (Array.isArray(obj)) {
      return obj.map((item) => convertKeysToCamel(item));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = snakeToCamel(key);
        acc[camelKey] = convertKeysToCamel(obj[key]);
        return acc;
      }, {} as Record<string, any>);
    }
    return obj;
  }
  
  export function convertListToCamelCase(
    list: Record<string, any>[]
  ): Record<string, any>[] {
    if (Array.isArray(list)) {
      return list.map(convertKeysToCamel);
    }
    return [];
  }
  