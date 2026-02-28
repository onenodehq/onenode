export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  current: boolean;
  databases?: Database[];
}

export interface Database {
  name: string;
  collections: Collection[];
}

export interface Collection {
  name: string;
  db_name: string;
}
